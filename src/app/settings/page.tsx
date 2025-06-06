"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Save, RefreshCw } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const scheduleFormSchema = z.object({
  dayOfWeek: z.string(),
  hour: z.string(),
  minute: z.string(),
  timezone: z.string(),
  enabled: z.boolean().default(true),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const DAYS_OF_WEEK = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
];

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [nextRun, setNextRun] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      dayOfWeek: "5", // Friday
      hour: "09",
      minute: "00",
      timezone: "America/New_York",
      enabled: true,
    },
  });

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings/schedule");
        if (response.ok) {
          const settings = await response.json();
          if (settings) {
            form.reset(settings);
            setLastRun(settings.lastRun);
            setNextRun(settings.nextRun);
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, [form]);

  const onSubmit = async (values: ScheduleFormValues) => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        alert("Schedule updated successfully!");
      } else {
        alert("Failed to update schedule");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleManualTrigger = async () => {
    try {
      const response = await fetch("/api/settings/trigger-collection", {
        method: "POST",
      });

      if (response.ok) {
        alert("Manual collection triggered successfully!");
        // Refresh last run time
        setLastRun(new Date().toISOString());
      } else {
        alert("Failed to trigger collection");
      }
    } catch (error) {
      console.error("Error triggering collection:", error);
      alert("Error triggering collection");
    }
  };

  const generateCronExpression = (values: Partial<ScheduleFormValues>) => {
    return `${values.minute || "00"} ${values.hour || "09"} * * ${values.dayOfWeek || "5"}`;
  };

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return "Never";
    return new Date(isoString).toLocaleString();
  };

  const watchedValues = form.watch();
  const cronExpression = generateCronExpression(watchedValues);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure YouTube video metrics collection schedule
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Schedule Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Collection Schedule</span>
            </CardTitle>
            <CardDescription>
              Set when to automatically collect YouTube video metrics using
              Inngest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Week</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day.value} value={day.value}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hour (24h)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            placeholder="09"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minute</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            placeholder="00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-gray-50 p-3 rounded text-sm">
                  <Label className="text-xs text-gray-600">
                    Cron Expression:
                  </Label>
                  <div className="font-mono text-gray-800">
                    {cronExpression}
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Schedule"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Status and Manual Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Collection Status</span>
            </CardTitle>
            <CardDescription>
              Monitor and manually trigger data collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Last Collection:</Label>
                <span className="text-sm text-gray-600">
                  {formatDateTime(lastRun)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Next Scheduled:</Label>
                <span className="text-sm text-gray-600">
                  {formatDateTime(nextRun)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Status:</Label>
                <span className="text-sm text-green-600 font-medium">
                  Active
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleManualTrigger}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Trigger Collection Now
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Manually collect metrics for all campaigns
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded text-sm">
              <h4 className="font-medium text-blue-900 mb-1">How it works:</h4>
              <ul className="text-blue-800 space-y-1 text-xs">
                <li>• Inngest automatically runs on your schedule</li>
                <li>• Fetches latest YouTube metrics for all campaigns</li>
                <li>• Stores snapshots in your database</li>
                <li>• Updates are reflected in campaign views</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
