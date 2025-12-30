# SYSTEM_CONTEXT.md — NeerSutra / Ship Routing & Marine Ops (Master Context for Copilot)

*Prepared for:* **MR. Dark**  
*Author:* JARVIS — canonical system context to be consumed by Copilot, developers, and the frontend.  
*Sources:* Primary technical specification and slide deck used to create this file.

---

## Purpose (how Copilot should use this)

This single-file master context is the **canonical design spec** for the Ship Routing Optimization & Marine Operations System (NeerSutra’s routing module).

Copilot should treat this as truth: use its names, data models, endpoints, algorithms, equations, and UX patterns when generating code, tests, API clients, components, or docs.

When asked to generate code, prefer data formats and JSON schemas found below. When in doubt about naming or where a piece of logic belongs, follow the modules and folder-layout sections described here.

---

## 1 — Executive summary (short, actionable)

NeerSutra’s routing engine is a **4D, vessel-aware, risk- and emission-sensitive route optimizer**. It constructs a time-expanded graph over **(lat, lon, time[, state])** and runs time-dependent **A\*** (or incremental **D\*Lite**) to produce waypoints with recommended speeds and ETAs while minimizing a composite objective:

- **fuel**
- **CO₂**
- **time**
- **risk**
- **congestion**

A hybrid **physics + ML** model computes fuel use; a **Voyage Risk Engine** scores safety; a **Congestion Predictor** forecasts port queues; a **Departure Advisor** finds optimal windows; a **Real-time Rerouter** monitors en-route sensors and AIS to trigger replans.

---

## 2 — System goals & success metrics

### Primary goals
- Produce safe, fuel-efficient, and auditable route plans.
- Provide ETA with uncertainty bounds.
- Reduce port waiting time via congestion-aware departure recommendations.
- Support fleet coordination (staggered departures).

### Success metrics
- Fuel estimate **MAPE < X%** after calibration (initial target <10% with ML residual).
- Average ETA error **< Y hours** under ensemble forecasting.
- Reduction in port wait time (pilot deployment) measured in hours.
- CO₂ reduction when eco-route selected (target ~15–25% vs baseline).

---

## 3 — High-level architecture (components & dataflows)

### Components
- **Data Ingest Layer:** AIS (live + historical), weather/ocean forecast tiles, bathymetry, port rules/schedules, vessel specs.
- **Preprocessing:** spatial/temporal gridding, QC, clustering (e.g., shipping lanes via OPTICS/DBSCAN).
- **Core Engine:** 4D Graph Constructor + Route Optimizer (A*/D*Lite), Hybrid Fuel Model, Risk Engine, Congestion Predictor.
- **Decision Services:** Departure Advisor, ETA Predictor, Green-route optimizer, Multi-route selector (Pareto).
- **Runtime:** Real-time Rerouter (threshold triggers).
- **Storage:** Time series DB + Postgres for metadata + object store for tiles.
- **Interfaces:** Captain dashboard, Port Authority view, REST/gRPC APIs, shipborne lightweight client.

### Dataflow (brief)
1. Ingest raw feeds  
2. Preprocess & tile  
3. Build time-sliced smart map  
4. Run time-dependent search + models  
5. Produce route(s) + risk/fuel/ETA  
6. Visualize / send to ship / store

---

## 4 — Data inputs (detailed)

### 1) AIS (Automatic Identification System)
- Live & historical tracks: *(MMSI, timestamp, lat, lon, SOG, COG, shipType, length, beam, draft, heading)*
- Uses: congestion density, historical incident mapping, anomaly detection, shipping-lane clustering.

### 2) Weather & Ocean Forecast Tiles
- Gridded tiles *(lat/lon/time)* with:
  - wind speed/direction
  - wave height/period/direction
  - surface currents *(u/v)*
  - optionally SST/pressure
- Temporal resolution: hourly or 3-hourly; lookahead typically 7 days.

### 3) Bathymetry & NAVDATA
- Depth grid (region-dependent resolution).
- Constraint: `depth > draft + safety_buffer`.

### 4) Port Rules & Schedules
- Berth windows, tide constraints, pilotage delays, local speed restrictions.

### 5) Vessel Specs & Engine Data
- Length, beam, draft, displacement
- Wetted surface **S** (m²), form factor **k**, propulsive efficiency **η**
- SFOC curve *(power → g/kWh)*
- Max power

### 6) Operational Constraints
- Crew preferences *(fastest vs green)*
- Mandatory arrival windows
- COLREGs constraints

---

## 5 — Canonical JSON schemas (drop-in examples)

### AIS JSON sample
```json
{
  "timestamp": "2025-12-15T14:30:00Z",
  "MMSI": 123456789,
  "latitude": 37.7749,
  "longitude": -122.4194,
  "SOG": 14.5,
  "COG": 135.0,
  "shipType": "Cargo",
  "length": 250.0,
  "beam": 32.0,
  "draft": 10.5,
  "heading": 133.0,
  "timestamp_received": "2025-12-15T14:30:05Z"
}
```

### Vessel spec JSON sample
```json
{
  "vesselID": "EXAMPLE123",
  "name": "CargoVessel",
  "length": 250.0,
  "beam": 32.0,
  "draft": 10.5,
  "displacement": 50000.0,
  "maxSpeed": 20.0,
  "wettedSurface": 10000.0,
  "formFactor": 1.08,
  "engineSpecs": {
    "maxPower": 10000.0,
    "SFOC_curve": [[1000, 180], [5000, 160], [10000, 155]]
  }
}
```

### Weather tile JSON sample
```json
{
  "tileID": "WeatherTile_01",
  "time": "2025-12-15T12:00Z",
  "bounds": { "lat_min": 30.0, "lat_max": 40.0, "lon_min": -130.0, "lon_max": -120.0 },
  "gridResolution": 1.0,
  "wind": [{ "lat": 31, "lon": -129, "speed": 15.0, "direction": 90 }],
  "waves": [{ "lat": 31, "lon": -129, "height": 2.5, "period": 8.0, "direction": 270 }],
  "currents": [{ "lat": 31, "lon": -129, "u": 0.5, "v": -0.2 }]
}
```

### Route JSON sample
```json
{
  "routeID": "Route_001",
  "waypoints": [
    { "lat": 30.0, "lon": -130.0, "time": "2025-12-15T12:00Z", "speed": 12.0, "ETA": "2025-12-16T06:00Z" }
  ],
  "totalDistance": 500.0,
  "totalFuel": 75.2,
  "totalCO2": 240.0,
  "arrivalTime": "2025-12-16T06:00Z",
  "routeCost": 1.23
}
```

---

## 6 — Core algorithms & formulas (implementor-ready)

### 6.1 Reynolds number
\[
Re = \frac{U L}{\nu}
\]
Where:
- \(U\) = ship speed (m/s)  
- \(L\) = length (m)  
- \(\nu\) = water kinematic viscosity

### 6.2 ITTC-1957 skin-friction coefficient
\[
C_f = \frac{0.075}{(\log_{10}(Re) - 2)^2}
\]

### 6.3 Calm-water frictional resistance
\[
R_f = \frac{1}{2} \rho U^2 S C_f (1 + k)
\]

### 6.4 Wave-added resistance
\[
R_w \approx C_A \rho g H
\]

### 6.5 Total resistance and power
\[
R_{total} = R_f + R_w
\]
\[
P_{eff} = R_{total} \cdot U
\]
\[
P_{delivered} = \frac{P_{eff}}{\eta_{prop}}
\]

### 6.6 Fuel rate
\[
\dot{m} = SFOC(P_{delivered}) \cdot P_{delivered}
\]

### 6.7 Edge cost function
\[
J = \alpha \, Fuel + \beta \, CO_2 + \gamma \, Time + \delta \, Risk + \epsilon \, Congestion
\]

CO₂ factor: **3.17 kg CO₂ / kg fuel**.

---

## 7 — Pseudocode (drop-in)

### EstimateFuel
```text
function EstimateFuel(segment, shipParams):
  Re = (segment.speed * shipParams.length) / waterViscosity
  Cf = 0.075 / ((log10(Re) - 2)^2)
  Rf = 0.5 * rho_water * segment.speed^2 * shipParams.S * Cf * (1 + shipParams.formFactor)
  Rw = ComputeWaveResistance(segment.waveHeight, segment.wavePeriod, shipParams)
  R_total = Rf + Rw
  P_eff = R_total * segment.speed
  P_delivered = P_eff / shipParams.propulsiveEfficiency
  fuelRate = shipParams.getSFOC(P_delivered) * P_delivered
  return fuelRate * segment.duration
```

### TimeDependentAStar
```text
function TimeDependentAStar(start, goal):
  openSet = priorityQueue()
  openSet.insert(start, priority=0)
  cameFrom = {}
  gScore[start] = 0

  while openSet not empty:
    current = openSet.pop()
    if current == goal:
      return ReconstructPath(cameFrom, current)

    for neighbor in neighbors(current):
      cost = ComputeCost(current, neighbor)
      tentativeG = gScore[current] + cost

      if tentativeG < gScore.get(neighbor, +inf):
        cameFrom[neighbor] = current
        gScore[neighbor] = tentativeG
        fScore = tentativeG + Heuristic(neighbor, goal)
        openSet.insertOrUpdate(neighbor, fScore)

  return failure
```

### MonteCarlo ETA
```text
function PredictETAwithUncertainty(route, weatherModels):
  samples = []
  for forecastVariant in weatherModels:
    eta = SimulateRouteETA(route, forecastVariant)
    samples.append(eta)
  return stats(samples)
```

---

## 8 — Module-level design

### 8.1 4D Graph Constructor
- **Input:** environmental tiles, ship spec, start window, grid resolution, allowed speeds
- **Output:** time-sliced nodes and edges
- Enforce bathymetry + AIS lane penalties

### 8.2 Route Optimizer
- Time-dependent A* with admissible heuristic
- Multi-objective Pareto output
- Incremental replans via D*Lite

### 8.3 Hybrid Fuel Model
- Physics core + ML residual
- APIs: `getSFOC(power)`, `predictFuel(segment)`

### 8.4 Voyage Risk Engine
- Segment-level risk aggregation (weather, depth, incidents, anomalies)

### 8.5 Congestion Predictor
- LSTM / temporal CNN on AIS densities
- Outputs queue forecasts + penalties

### 8.6 Departure Advisor
- Simulate departure offsets; rank by fuel/ETA/risk/wait

### 8.7 Real-time Rerouter
- Threshold-based replans with safety overrides

---

## 9 — API surface (REST)

- `GET  /api/v1/context/summary`
- `POST /api/v1/route/compute`
- `GET  /api/v1/route/{routeID}`
- `GET  /api/v1/tiles/weather?bbox=&time=`
- `GET  /api/v1/ais/recent?bbox=&since=`
- `POST /api/v1/realtime/ship/{vesselID}/telemetry`
- `GET  /api/v1/port/{portID}/congestion?window=`

---

## 10 — Frontend components & UX

- **MapPanel** (Mapbox/Deck.gl)
- **RouteComparePanel**
- **ETADistributionWidget**
- **SegmentDetailTooltip**
- **CongestionTimeline**
- **CaptainConsole**

---

## 11 — ML model notes

### Hybrid residual
- Features: speed, Hs/T, power, currents, temp, fouling
- Model: GBT or small NN
- Metrics: MAPE, RMSE

### AIS anomaly
- Supervised or unsupervised detection

### Congestion
- LSTM / temporal convolution

---

## 12 — Testing & validation
- Unit, integration, calibration, safety, load tests

---

## 13 — Performance & deployment
- Heavy compute server-side
- Lightweight ship client
- TSDB + Postgres + object storage

---

## 14 — Security & compliance
- mTLS, audit logs, safety overrides, retention policies

---

## 15 — Versioning & provenance
- Model hashes, forecast provenance, config versions