import { sql } from "@/lib/db";

export default async function TestDbPage() {
  try {
    const result =
      await sql.query`SELECT NOW() as current_time, version() as db_version`;

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">
            ✅ Connected successfully!
          </p>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>
              <strong>Current time:</strong>{" "}
              {new Date(result[0].current_time).toLocaleString()}
            </p>
            <p>
              <strong>Database version:</strong> {result[0].db_version}
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Database connection error:", error);
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">❌ Connection failed</p>
          <p className="text-red-600 text-sm mt-2">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
        </div>
      </div>
    );
  }
}
