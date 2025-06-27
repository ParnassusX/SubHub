import React, { useState } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';

const ImportExport: React.FC = () => {
  const { subscriptions, addSubscription } = useSubscriptions();
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const exportToCSV = () => {
    if (subscriptions.length === 0) {
      alert('No subscriptions to export');
      return;
    }

    const headers = ['Name', 'Cost', 'Frequency', 'Category', 'Start Date', 'Description', 'Website'];
    const csvContent = [
      headers.join(','),
      ...subscriptions.map(sub => [
        `"${sub.name}"`,
        sub.cost,
        sub.frequency,
        `"${sub.category}"`,
        sub.startDate,
        `"${sub.description || ''}"`,
        `"${sub.website || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `subhub-subscriptions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (subscriptions.length === 0) {
      alert('No subscriptions to export');
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      subscriptions: subscriptions.map(sub => ({
        name: sub.name,
        cost: sub.cost,
        frequency: sub.frequency,
        category: sub.category,
        startDate: sub.startDate,
        description: sub.description,
        website: sub.website
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `subhub-backup-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError('');

    try {
      const text = await file.text();
      let importedData: any[] = [];

      if (file.name.endsWith('.csv')) {
        // Parse CSV
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          throw new Error('CSV file must have at least a header and one data row');
        }

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
        const nameIndex = headers.findIndex(h => h.includes('name'));
        const costIndex = headers.findIndex(h => h.includes('cost') || h.includes('price') || h.includes('amount'));
        const frequencyIndex = headers.findIndex(h => h.includes('frequency') || h.includes('billing'));
        const categoryIndex = headers.findIndex(h => h.includes('category') || h.includes('type'));
        const dateIndex = headers.findIndex(h => h.includes('date') || h.includes('start'));

        if (nameIndex === -1 || costIndex === -1) {
          throw new Error('CSV must have at least "name" and "cost" columns');
        }

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          if (values.length < 2) continue;

          const subscription = {
            name: values[nameIndex] || `Imported Subscription ${i}`,
            cost: parseFloat(values[costIndex]) || 0,
            frequency: (values[frequencyIndex]?.toLowerCase().includes('year') ? 'Yearly' : 'Monthly') as 'Monthly' | 'Yearly',
            category: values[categoryIndex] || 'Other',
            startDate: values[dateIndex] || new Date().toISOString().split('T')[0],
            description: `Imported from CSV on ${new Date().toLocaleDateString()}`,
          };

          if (subscription.name && subscription.cost > 0) {
            importedData.push(subscription);
          }
        }
      } else if (file.name.endsWith('.json')) {
        // Parse JSON
        const jsonData = JSON.parse(text);
        const subscriptions = jsonData.subscriptions || jsonData;
        
        if (!Array.isArray(subscriptions)) {
          throw new Error('JSON file must contain an array of subscriptions');
        }

        importedData = subscriptions.map((sub: any) => ({
          name: sub.name || 'Imported Subscription',
          cost: parseFloat(sub.cost) || parseFloat(sub.price) || parseFloat(sub.amount) || 0,
          frequency: (sub.frequency?.toLowerCase().includes('year') ? 'Yearly' : 'Monthly') as 'Monthly' | 'Yearly',
          category: sub.category || sub.type || 'Other',
          startDate: sub.startDate || sub.date || new Date().toISOString().split('T')[0],
          description: sub.description || `Imported from JSON on ${new Date().toLocaleDateString()}`,
          website: sub.website || sub.url || undefined,
        })).filter((sub: any) => sub.name && sub.cost > 0);
      } else {
        throw new Error('Please upload a CSV or JSON file');
      }

      if (importedData.length === 0) {
        throw new Error('No valid subscriptions found in the file');
      }

      // Import subscriptions
      let successCount = 0;
      for (const subscription of importedData) {
        try {
          await addSubscription(subscription);
          successCount++;
        } catch (error) {
          console.error('Error importing subscription:', subscription.name, error);
        }
      }

      alert(`Successfully imported ${successCount} out of ${importedData.length} subscriptions!`);
      
      // Reset file input
      event.target.value = '';

    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-[#20364b] rounded-xl border border-[#2e4e6b] p-6">
      <h3 className="text-white text-lg font-bold mb-4">Import & Export</h3>
      
      {/* Export Section */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">Export Your Data</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportToCSV}
            className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Export as CSV
          </button>
          <button
            onClick={exportToJSON}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Export as JSON
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-2">
          Export your subscriptions to backup or transfer to another device
        </p>
      </div>

      {/* Import Section */}
      <div>
        <h4 className="text-white font-medium mb-3">Import Subscriptions</h4>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileImport}
            disabled={isImporting}
            className="hidden"
            id="import-file"
          />
          <label
            htmlFor="import-file"
            className={`cursor-pointer inline-block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isImporting 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isImporting ? 'Importing...' : 'Choose File to Import'}
          </label>
          <p className="text-gray-400 text-xs mt-2">
            Supports CSV and JSON files. CSV should have columns: name, cost, frequency, category, date
          </p>
        </div>
        
        {importError && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-red-400 text-sm">{importError}</p>
          </div>
        )}
      </div>

      {/* Sample Format */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h5 className="text-white text-sm font-medium mb-2">Sample CSV Format:</h5>
        <pre className="text-gray-300 text-xs overflow-x-auto">
{`Name,Cost,Frequency,Category,Start Date
Netflix,15.99,Monthly,Entertainment,2024-01-15
Adobe Creative,239.88,Yearly,Productivity,2024-03-01`}
        </pre>
      </div>
    </div>
  );
};

export default ImportExport;
