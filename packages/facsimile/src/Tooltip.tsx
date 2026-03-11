import './Tooltip.css'
export type TooltipProps = { text: string; x: number; y: number };

export function Tooltip({x, y, text}: TooltipProps) {
  return (
    <div className="tooltip" style={{left: x + 10, top: y - 30}}>
      {text}
    </div>
  );
}