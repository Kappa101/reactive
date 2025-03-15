import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from "lucide-react";

interface PackageData {
  [repo: string]: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

const DependencyDashboard: React.FC = () => {
  const [data, setData] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/combined_package_data.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching package data:", error));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Microfrontend Dependency Dashboard</h1>
      {data &&
        Object.entries(data).map(([repo, { dependencies, devDependencies }]) => (
          <Card key={repo} className="mb-6">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">{repo}</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Version</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dependencies &&
                    Object.entries(dependencies).map(([pkg, version]) => (
                      <TableRow key={pkg}>
                        <TableCell>Dependency</TableCell>
                        <TableCell>{pkg}</TableCell>
                        <TableCell>{version}</TableCell>
                      </TableRow>
                    ))}
                  {devDependencies &&
                    Object.entries(devDependencies).map(([pkg, version]) => (
                      <TableRow key={pkg}>
                        <TableCell>Dev Dependency</TableCell>
                        <TableCell>{pkg}</TableCell>
                        <TableCell>{version}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default DependencyDashboard;