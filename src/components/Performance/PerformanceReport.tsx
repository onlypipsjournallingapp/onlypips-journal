
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Clock, BarChart3, Lightbulb } from "lucide-react";
import { performanceAnalysisService, PerformanceMetrics } from "@/services/performanceAnalysis";
import { useToast } from "@/hooks/use-toast";

interface PerformanceReportProps {
  userId: string;
}

const PerformanceReport: React.FC<PerformanceReportProps> = ({ userId }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const reportMetrics = await performanceAnalysisService.analyzeUserPerformance(userId);
      setMetrics(reportMetrics);
      
      toast({
        title: "Report Generated",
        description: "Your performance report has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate performance report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceLabelColor = (label: string) => {
    switch (label) {
      case 'Excellent': return 'bg-green-500';
      case 'Consistent': return 'bg-blue-500';
      case 'Improving': return 'bg-yellow-500';
      case 'Volatile': return 'bg-orange-500';
      case 'Declining': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (!metrics) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Performance Insight Report
          </CardTitle>
          <p className="text-muted-foreground">
            Generate a comprehensive analysis of your trading performance
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={generateReport} 
            disabled={isLoading}
            size="lg"
            className="mt-4"
          >
            {isLoading ? "Generating Report..." : "Generate Report"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Performance Report
              </CardTitle>
              <p className="text-muted-foreground">
                Analysis of {metrics.totalTrades} trades
              </p>
            </div>
            <Badge className={getPerformanceLabelColor(metrics.performanceLabel)}>
              {metrics.performanceLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Win Rate</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{metrics.winRate.toFixed(1)}%</div>
                  <Progress value={metrics.winRate} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {metrics.totalPnL >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">Total P/L</span>
                </div>
                <div className={`text-2xl font-bold mt-2 ${metrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.totalPnL)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Profit Factor</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Avg. Hold Time</span>
                </div>
                <div className="text-2xl font-bold mt-2">
                  {metrics.avgHoldingTime > 0 ? formatDuration(metrics.avgHoldingTime) : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="strategies" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="risk">Risk/Reward</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="strategies" className="space-y-4">
              <h3 className="text-lg font-semibold">Strategy Performance</h3>
              {metrics.strategyPerformance.length > 0 ? (
                <div className="space-y-3">
                  {metrics.strategyPerformance.map((strategy, index) => (
                    <Card key={strategy.strategyId}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{strategy.strategyName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {strategy.trades} trades • {strategy.winRate.toFixed(1)}% win rate
                            </p>
                            {strategy.avgRR > 0 && (
                              <p className="text-sm text-muted-foreground">
                                Avg R:R: {strategy.avgRR.toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div className={`text-lg font-bold ${strategy.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(strategy.totalPnL)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No strategy data available. Start assigning strategies to your trades!</p>
              )}
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <h3 className="text-lg font-semibold">Monthly Performance</h3>
              <div className="space-y-3">
                {metrics.monthlyPerformance.map((month) => (
                  <Card key={month.month}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">
                            {new Date(month.month + '-01').toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {month.trades} trades • {month.winRate.toFixed(1)}% win rate
                          </p>
                        </div>
                        <div className={`text-lg font-bold ${month.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(month.pnl)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              <h3 className="text-lg font-semibold">Risk/Reward Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Average R:R Ratio</h4>
                    <div className="text-3xl font-bold">
                      {metrics.riskRewardAnalysis.averageRR > 0 ? 
                        `1:${metrics.riskRewardAnalysis.averageRR.toFixed(2)}` : 
                        'N/A'
                      }
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on {metrics.riskRewardAnalysis.tradesWithRR} trades with R:R data
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">R:R Distribution</h4>
                    <div className="space-y-2">
                      {metrics.riskRewardAnalysis.rrDistribution.map((dist) => (
                        <div key={dist.range} className="flex justify-between text-sm">
                          <span>{dist.range}</span>
                          <span>{dist.count} trades</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Key Insights
              </h3>
              <div className="space-y-3">
                {metrics.insights.map((insight, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <p className="text-sm">{insight}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t">
            <Button onClick={generateReport} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh Report"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceReport;
