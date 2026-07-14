# Draw.io XML

A `.drawio` file is `mxGraphModel` XML. Generate this directly.

## Required Skeleton

```xml
<mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1000" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
  </root>
</mxGraphModel>
```

All normal cells use `parent="1"` unless intentionally using groups/layers.

## Vertex

```xml
<mxCell id="api" value="API service&lt;br&gt;&lt;font style=&quot;font-size: 10px&quot;&gt;apps/api/src&lt;/font&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
  <mxGeometry x="360" y="220" width="180" height="72" as="geometry"/>
</mxCell>
```

## Edge

Edges must not be self-closing. Include geometry:

```xml
<mxCell id="edge-client-api" value="" edge="1" parent="1" source="client" target="api" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;exitX=1;exitY=0.5;entryX=0;entryY=0.5;">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

Use waypoints for long or crossing routes:

```xml
<mxGeometry relative="1" as="geometry">
  <Array as="points">
    <mxPoint x="640" y="460"/>
    <mxPoint x="440" y="460"/>
  </Array>
</mxGeometry>
```

## Text Labels

Prefer separate text cells over edge labels:

```xml
<mxCell id="label-http" value="HTTP" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;fontSize=11;" vertex="1" parent="1">
  <mxGeometry x="290" y="236" width="52" height="20" as="geometry"/>
</mxCell>
```

## XML Rules

- Escape attribute values: `&amp;`, `&lt;`, `&gt;`, `&quot;`.
- Use unique `id` values.
- Include `id="0"` and `id="1"`.
- Give every vertex `x`, `y`, `width`, `height`, and `as="geometry"`.
- Give every edge `mxGeometry relative="1" as="geometry"`.
- Avoid XML comments.
- Use simple styles; correctness and readability beat fancy styling.
