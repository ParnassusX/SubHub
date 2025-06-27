export default function AddSubscriptions() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Add Subscriptions</h1>
        <p className="text-muted-foreground mt-2">
          Add new subscription services to track and manage.
        </p>
      </div>
      
      <div className="bg-card p-8 rounded-lg border border-border text-center">
        <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground">
          Subscription addition form is being built. This will include:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• Service name and details</li>
          <li>• Billing amount and frequency</li>
          <li>• Payment method tracking</li>
          <li>• Category assignment</li>
          <li>• Renewal date setup</li>
        </ul>
      </div>
    </div>
  )
}
