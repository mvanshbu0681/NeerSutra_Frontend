# Graph Report - Argo_Frontend  (2026-05-22)

## Corpus Check
- 136 files · ~367,294 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 384 nodes · 351 edges · 13 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 18|Community 18]]

## God Nodes (most connected - your core abstractions)
1. `random()` - 15 edges
2. `generateLocationAnalysis()` - 12 edges
3. `generateOilSpillEvent()` - 9 edges
4. `generateIrregularPolygon()` - 8 edges
5. `generateHABEvent()` - 8 edges
6. `generateCycloneEvent()` - 8 edges
7. `generateProvenance()` - 7 edges
8. `generateConfidenceScore()` - 7 edges
9. `generateValidationMetrics()` - 7 edges
10. `generateMHWEvent()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `useDashboardData()` --calls--> `useFilteredEvents()`  [INFERRED]
  app/hooks/useDashboardData.ts → src/store/useEWSStore.ts
- `useDashboardData()` --calls--> `useHighPotentialZones()`  [INFERRED]
  app/hooks/useDashboardData.ts → src/store/usePFZStore.ts
- `CHELayerLegend()` --calls--> `getLayerColorScale()`  [INFERRED]
  app/neersutra/components/Map/Layers/CHEHeatmapLayer.tsx → src/store/useCHEStore.ts
- `EWSMapPanel()` --calls--> `useFilteredEvents()`  [INFERRED]
  app/neersutra/ews/components/EWSMapPanelDeckGL.tsx → src/store/useEWSStore.ts
- `EWSMapPanel()` --calls--> `useFilteredEvents()`  [INFERRED]
  app/neersutra/ews/components/EWSMapPanelMapLibre.tsx → src/store/useEWSStore.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.29
Nodes (16): advectPolygon(), generateConfidenceScore(), generateCycloneEvent(), generateCycloneTrack(), generateHABEvent(), generateHABGrid(), generateIrregularPolygon(), generateMHWEvent() (+8 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (9): formatDate(), FloatPopupDemo(), formatTime(), FloatPopup(), LevelList(), SimpleLevelList(), formatLatLon(), formatNumber() (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (6): EWSMapPanel(), EWSMapPanel(), useDashboardData(), useFilteredEvents(), useHighPotentialZones(), usePFZPolygons()

### Community 3 - "Community 3"
Cohesion: 0.23
Nodes (17): calculateDZRI(), calculateHypoxiaIndicators(), calculateORS(), calculatePEI(), clamp(), classifyRisk(), estimateRecoveryTime(), generateDOProfile() (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (15): analyzeLocation(), calculateConfidence(), calculateFactorSuitability(), calculateHSI(), clusterCells(), extractPFZPolygons(), gaussianBlob(), gaussianSuitability() (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (2): CHELayerLegend(), getLayerColorScale()

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (1): GLTFErrorBoundary

### Community 8 - "Community 8"
Cohesion: 0.31
Nodes (8): FloatPopupStandalone(), formatDate(), formatLatLon(), formatNumber(), formatTime(), generateMockLevels(), LevelList(), StandaloneDemo()

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (1): FloaterAPI

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (1): FloatChatAPI

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (1): ThreeJSErrorBoundary

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (1): ErrorBoundary

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (2): ThemeToggle(), useTheme()

## Knowledge Gaps
- **Thin community `Community 6`** (13 nodes): `CHEHeatmapLayer.tsx`, `CHELayerLegend()`, `useCHELayers()`, `useCHEStore.ts`, `getDepthLabel()`, `getLayerColorScale()`, `getRiskColor()`, `selectActiveLayer()`, `selectDepth()`, `selectIsLoading()`, `selectSelectedLocation()`, `selectSimulationGrid()`, `selectTime()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (11 nodes): `FloaterModel3D.jsx`, `AnimatedFloaterModel()`, `FloaterModel3D()`, `GLTFErrorBoundary`, `.componentDidCatch()`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`, `OceanWaves()`, `SafeFloaterModel()`, `StatusLights()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (7 nodes): `floaterAPI.js`, `FloaterAPI`, `.getAllLatestSummaries()`, `.getFloaterByDate()`, `.getFloaterDates()`, `.getFloaterLatest()`, `.getLatestFloaters()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (6 nodes): `floatChatAPI.js`, `FloatChatAPI`, `.checkHealth()`, `.getErrorMessage()`, `.getSampleQuestion()`, `.sendChatQuery()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (6 nodes): `ThreeJSErrorBoundary.jsx`, `ThreeJSErrorBoundary`, `.componentDidCatch()`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (6 nodes): `ErrorBoundary.jsx`, `ErrorBoundary`, `.componentDidCatch()`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (4 nodes): `ThemeProvider.tsx`, `ThemeProvider()`, `ThemeToggle()`, `useTheme()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._