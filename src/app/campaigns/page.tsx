import { sql } from "@/lib/db";

interface Campaign {
  id: number;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export default async function CampaignsPage() {
  try {
    // First check if campaigns table exists, if not, show setup instructions
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'campaigns'
      ) as exists
    `;

    if (!tableExists[0].exists) {
      return (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">YouTube Campaigns</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">
              Setup Required
            </h2>
            <p className="text-yellow-700 mb-4">
              The campaigns table doesn't exist yet. You need to create it
              first.
            </p>
            <div className="bg-gray-800 text-green-400 p-4 rounded font-mono text-sm">
              <p className="mb-2">
                Run this SQL to create the campaigns table:
              </p>
              <pre>{`CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);`}</pre>
            </div>
          </div>
        </div>
      );
    }

    // Fetch campaigns from your database
    const campaigns = await sql`
      SELECT id, name, description, status, created_at, updated_at 
      FROM campaigns 
      ORDER BY created_at DESC
    `;

    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">YouTube Campaigns</h1>
          <div className="text-sm text-gray-500">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                No campaigns yet
              </h2>
              <p className="text-gray-500">
                Create your first YouTube campaign to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign: Campaign) => (
              <div
                key={campaign.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {campaign.name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === "active"
                        ? "bg-green-100 text-green-800"
                        : campaign.status === "paused"
                        ? "bg-yellow-100 text-yellow-800"
                        : campaign.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>

                {campaign.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {campaign.description}
                  </p>
                )}

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {campaign.updated_at &&
                    campaign.updated_at !== campaign.created_at && (
                      <div className="flex justify-between">
                        <span>Updated:</span>
                        <span>
                          {new Date(campaign.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Database error:", error);
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">YouTube Campaigns</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Error Loading Campaigns
          </h2>
          <p className="text-red-600">
            Failed to load campaigns. Please check your database connection and
            try again.
          </p>
          <p className="text-red-500 text-sm mt-2">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
        </div>
      </div>
    );
  }
}
