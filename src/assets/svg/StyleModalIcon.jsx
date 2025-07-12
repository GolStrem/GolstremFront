import "./stylesvg.css"

const StyleModalIcon = ({ className = "StyleModalIcon", color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 314.37 21.68"
    className={className}
    {...props}
  >
    <g data-name="Calque 2">
      <g data-name="Calque 1">
        <polygon
          points="208.8 21.68 0 21.68 5 0 213.8 0 208.8 21.68"
          fill={color}
        />
        <polygon
          points="260.86 21.68 223.87 21.68 228.87 0 265.86 0 260.86 21.68"
          fill={color}
        />
        <polygon
          points="309.37 21.68 299.2 21.68 304.2 0 314.37 0 309.37 21.68"
          fill={color}
        />
        <polygon
          points="289.93 21.68 279.75 21.68 284.75 0 294.93 0 289.93 21.68"
          fill={color}
        />
      </g>
    </g>
  </svg>
);

export default StyleModalIcon;
