"use client";

import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  Delete01Icon,
  Loading01Icon,
  ClipboardListIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { getAllHealthLogs, deletePainLog } from "../actions";
import type { HealthLog } from "@/lib/types";
import AppHeader from "@/components/layout/AppHeader";
import Link from "next/link";

export default function HealthLogsPage() {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function loadLogs() {
    try {
      const data = await getAllHealthLogs();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    getAllHealthLogs()
      .then((data) => {
        if (cancelled) return;
        setLogs(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching logs:", error);
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;

    setIsDeleting(id);
    try {
      const result = await deletePainLog(id);
      if (result.success) {
        await loadLogs();
      } else {
        alert(result.error || "Failed to delete log");
      }
    } catch (error) {
      console.error("Error deleting log:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const getPainColor = (level: number) => {
    if (level <= 3) return "text-teal-600 dark:text-teal-400";
    if (level <= 6) return "text-purple-600 dark:text-purple-400";
    return "text-orange-600 dark:text-orange-400";
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <AppHeader backHref="/" />

      <main id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl">
        <section className="space-y-2">
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={ClipboardListIcon} className="h-8 w-8 text-primary" aria-hidden="true" />
            <h1 className="text-3xl font-bold tracking-tight">
              Health Logs
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your historical record of pain levels, moods, and notes.
          </p>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <p className="text-muted-foreground">Loading your health records...</p>
          </div>
        ) : logs.length === 0 ? (
          <Card className="border-none shadow-sm bg-card ring-1 ring-border text-center py-12">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <HugeiconsIcon icon={Calendar01Icon} className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-foreground">No logs found</p>
                <p className="text-muted-foreground">Start tracking your pain levels on the dashboard.</p>
              </div>
              <Link href="/">
                <Button variant="outline" className="rounded-full">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-sm bg-card ring-1 ring-border overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Pain Log History</CardTitle>
              <CardDescription className="text-muted-foreground">
                Review and manage your past entries.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-center">Pain Level</TableHead>
                      <TableHead className="font-semibold">Mood</TableHead>
                      <TableHead className="font-semibold">Notes</TableHead>
                      <TableHead className="font-semibold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.loggedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className={`text-center font-bold ${getPainColor(log.painLevel)}`}>
                          {log.painLevel}/10
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.moodTag}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                          {log.notes || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(log.id)}
                            disabled={isDeleting === log.id}
                            aria-label={`Delete log from ${new Date(log.loggedAt).toLocaleDateString()}`}
                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            {isDeleting === log.id ? (
                              <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" aria-hidden="true" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
