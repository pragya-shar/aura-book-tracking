/**
 * Token Decimals Checker Component
 * 
 * This component helps diagnose decimal issues and provides
 * deployment information for whole number tokens.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { AlertTriangle, CheckCircle, Info, Coins } from 'lucide-react';
import { getActualTokenDecimals, getTokenInfo, AURACOIN_CONFIG } from '../utils/auraCoinUtils';
import { getDeploymentInfo, explainCurrentContractIssue } from '../utils/deployWholeNumberAuraCoin';

interface TokenDecimalsCheckerProps {
  isVisible?: boolean;
}

export const TokenDecimalsChecker: React.FC<TokenDecimalsCheckerProps> = ({ 
  isVisible = false 
}) => {
  const [contractDecimals, setContractDecimals] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeploymentInfo, setShowDeploymentInfo] = useState(false);

  const checkContractDecimals = async () => {
    setIsLoading(true);
    try {
      const decimals = await getActualTokenDecimals();
      setContractDecimals(decimals);
    } catch (error) {
      console.error('Error checking contract decimals:', error);
      setContractDecimals(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      checkContractDecimals();
    }
  }, [isVisible]);

  const deploymentInfo = getDeploymentInfo();
  const currentIssue = explainCurrentContractIssue();

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* Current Contract Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Decimals Analysis
          </CardTitle>
          <CardDescription>
            Checking your deployed AuraCoin contract configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Contract ID:</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {AURACOIN_CONFIG.CONTRACT_ID.slice(0, 8)}...
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Contract Decimals:</span>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Badge variant="outline">Checking...</Badge>
              ) : contractDecimals !== null ? (
                <Badge variant={contractDecimals === 0 ? "default" : "destructive"}>
                  {contractDecimals} decimal{contractDecimals !== 1 ? 's' : ''}
                </Badge>
              ) : (
                <Badge variant="secondary">Unknown</Badge>
              )}
            </div>
          </div>

          <Button 
            onClick={checkContractDecimals} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? 'Checking...' : 'Check Again'}
          </Button>

          {contractDecimals !== null && contractDecimals > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Issue Found:</strong> Your contract has {contractDecimals} decimal places. 
                This causes Freighter to show values like "0.000000017310000466 AURA" 
                instead of whole numbers like "1736 AURA".
              </AlertDescription>
            </Alert>
          )}

          {contractDecimals === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Perfect!</strong> Your contract uses whole numbers (0 decimals). 
                Both your app and Freighter wallet should show the same whole number values.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Problem Explanation */}
      {contractDecimals !== null && contractDecimals > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Why This Happens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {currentIssue.explanation}
            </p>
            
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">Your Current Situation:</p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• Contract has {contractDecimals} decimal places</li>
                <li>• App tries to show whole numbers</li>
                <li>• Freighter shows actual decimal values</li>
                <li>• "1 page = 1 AURA" concept doesn't work properly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solution Options */}
      {contractDecimals !== null && contractDecimals > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solution Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Option 1: Deploy New Whole Number Contract (Recommended)
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Deploy a new AuraCoin contract with 0 decimals for perfect "1 page = 1 AURA" experience.
                </p>
                <div className="mt-2">
                  <Button 
                    onClick={() => setShowDeploymentInfo(!showDeploymentInfo)}
                    variant="outline" 
                    size="sm"
                  >
                    {showDeploymentInfo ? 'Hide' : 'Show'} Deployment Guide
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-sm">
                  Option 2: Keep Current Contract & Fix Math
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Update the app to properly handle {contractDecimals} decimals so both app and wallet match.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Information */}
      {showDeploymentInfo && (
        <Card>
          <CardHeader>
            <CardTitle>🚀 New Contract Deployment Guide</CardTitle>
            <CardDescription>
              Step-by-step guide to deploy a whole number AuraCoin contract
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Benefits of New Contract:</h4>
              <ul className="space-y-1">
                {deploymentInfo.solution.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Deployment Steps:</h4>
              <ol className="space-y-1">
                {deploymentInfo.deploymentSteps.map((step, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Migration Options:</h4>
              <div className="grid gap-3">
                {deploymentInfo.migrationOptions.map((option, index) => (
                  <div key={index} className="border rounded p-3">
                    <h5 className="font-medium text-sm">{option.option}</h5>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                    <div className="mt-2 text-xs">
                      <span className="text-green-600">Pros: {option.pros.join(', ')}</span>
                      <br />
                      <span className="text-orange-600">Cons: {option.cons.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> If you want to deploy a new contract, 
                you'll need to use Soroban CLI or a contract deployment service. 
                The new contract should be configured with 0 decimals from the start.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TokenDecimalsChecker;