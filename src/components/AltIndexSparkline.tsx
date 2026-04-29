interface AltIndexSparklineProps {
  values: number[];
}

export function AltIndexSparkline({ values }: AltIndexSparklineProps): JSX.Element {
  if (values.length < 2) {
    return <div className="sparkline sparkline-empty">No history yet</div>;
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const delta = Math.max(max - min, 1);

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - min) / delta) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Altcoin index history">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
