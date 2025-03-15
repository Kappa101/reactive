import React, { useState, useEffect } from "react";
import { Table, Input } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, Tab } from "@/components/ui/tabs";
import { Search } from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState({});
  const [search, setSearch] = useState("");
  const [view, setView] = useState("dependencies");

  useEffect(() => {
    fetch("/combined_package_data.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  const filteredRepos = Object.keys(data).filter((repo) =>
    repo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Search className="w-5 h-5" />
            <Input
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs defaultValue="dependencies" onValueChange={setView}>
            <Tab value="dependencies">Dependencies</Tab>
            <Tab value="devDependencies">DevDependencies</Tab>
          </Tabs>
          <Table>
            <thead>
              <tr>
                <th>Repository</th>
                <th>{view}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepos.map((repo) => (
                <tr key={repo}>
                  <td>{repo}</td>
                  <td>
                    {data[repo][view]
                      ? Object.keys(data[repo][view]).join(", ")
                      : "No dependencies"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
