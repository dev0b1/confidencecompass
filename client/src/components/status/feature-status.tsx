import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function FeatureStatus() {
  const features = [
    {
      name: "Voice Analysis",
      enabled: true,
      description: "Speech transcription and analysis",
      required: "OpenAI API Key"
    },
    {
      name: "Speech Practice",
      enabled: true,
      description: "AI-powered speech practice sessions",
      required: "None"
    },
    {
      name: "Session Recording",
      enabled: true,
      description: "Practice session recording and metrics",
      required: "None (In-Memory)"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {features.map((feature) => (
            <div key={feature.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-600"></div>
                <div>
                  <h4 className="font-medium">{feature.name}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">
                  Ready
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <div className="text-sm text-gray-600">
            Environment: <Badge variant="outline">Development</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 