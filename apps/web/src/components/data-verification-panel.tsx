'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@dopaforge/ui';
import { CheckCircle2, AlertCircle, XCircle, RefreshCw, FileText } from 'lucide-react';
import { verifyDataSaving, createVerificationReport, type VerificationResult } from '@/lib/data-verification';
import { useUser } from '@/hooks/useUser';
import { motion, AnimatePresence } from 'framer-motion';

export function DataVerificationPanel() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [results, setResults] = useState<VerificationResult[] | null>(null);
  const [showReport, setShowReport] = useState(false);
  const { user } = useUser();

  const runVerification = async () => {
    if (!user) return;

    setIsVerifying(true);
    try {
      const verificationResults = await verifyDataSaving(user.id);
      setResults(verificationResults);
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const downloadReport = () => {
    if (!results) return;

    const report = createVerificationReport(results);
    const blob = new Blob([report], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weryfikacja-danych-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: VerificationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: VerificationResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weryfikacja zapisu danych</span>
          <div className="flex gap-2">
            {results && (
              <Button
                size="sm"
                variant="outline"
                onClick={downloadReport}
              >
                <FileText className="h-4 w-4 mr-2" />
                Pobierz raport
              </Button>
            )}
            <Button
              size="sm"
              onClick={runVerification}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Weryfikowanie...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Weryfikuj
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Kliknij "Weryfikuj" aby sprawdzić czy wszystkie moduły poprawnie zapisują dane.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Podsumowanie */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {results.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Sukces</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {results.filter(r => r.status === 'warning').length}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Ostrzeżenia</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {results.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Błędy</div>
              </div>
            </div>

            {/* Lista wyników */}
            <div className="space-y-2">
              <button
                onClick={() => setShowReport(!showReport)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showReport ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
              </button>
              
              <AnimatePresence>
                {showReport && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {results.map((result, index) => (
                      <motion.div
                        key={result.module}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                      >
                        <div className="flex items-start gap-3">
                          {getStatusIcon(result.status)}
                          <div className="flex-1">
                            <h4 className="font-medium">{result.module}</h4>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                            {result.details && (
                              <details className="mt-2">
                                <summary className="text-xs text-muted-foreground cursor-pointer">
                                  Zobacz szczegóły
                                </summary>
                                <pre className="text-xs mt-2 p-2 bg-muted/50 rounded overflow-x-auto">
                                  {JSON.stringify(result.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}