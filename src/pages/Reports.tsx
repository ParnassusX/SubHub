export default function Reports() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Analyze your subscription spending patterns and trends.
        </p>
      </div>
      
      <div className="bg-card p-8 rounded-lg border border-border text-center">
        <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground">
          Analytics and reporting features are being built. This will include:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• Spending trends over time</li>
          <li>• Category breakdowns</li>
          <li>• Cost optimization suggestions</li>
          <li>• Monthly/yearly reports</li>
          <li>• Export capabilities</li>
        </ul>
      </div>
    </div>
  )
}
