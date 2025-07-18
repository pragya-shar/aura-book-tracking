import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFreighter } from '@/contexts/FreighterContext';
import { createPaymentTransaction, submitTransaction, isValidStellarAddress } from '@/utils/stellarUtils';
import { toast } from '@/hooks/use-toast';
import { Send, MessageSquare, Loader2, CheckCircle } from 'lucide-react';

export const WalletDemo = () => {
  const { 
    isWalletConnected, 
    walletAddress, 
    signTransactionWithWallet, 
    signMessageWithWallet,
    network 
  } = useFreighter();
  
  const [message, setMessage] = useState('Hello from Aura Book Tracking!');
  const [signedMessage, setSignedMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('1');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleSignMessage = async () => {
    if (!isWalletConnected || !walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Freighter wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const signed = await signMessageWithWallet(message);
      setSignedMessage(signed);
      toast({
        title: "Message Signed!",
        description: "Your message has been signed successfully",
      });
    } catch (error) {
      toast({
        title: "Signing Failed",
        description: error instanceof Error ? error.message : "Failed to sign message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendPayment = async () => {
    if (!isWalletConnected || !walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Freighter wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!isValidStellarAddress(recipient)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Stellar address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create the payment transaction
      const xdr = await createPaymentTransaction(
        walletAddress,
        recipient,
        amount,
        undefined,
        network as 'TESTNET' | 'PUBLIC'
      );

      // Sign the transaction
      const signedXdr = await signTransactionWithWallet(xdr, network as 'TESTNET' | 'PUBLIC');

      // Submit the transaction
      const result = await submitTransaction(signedXdr, network as 'TESTNET' | 'PUBLIC');
      
      setTxHash(result.hash);
      toast({
        title: "Payment Sent!",
        description: `Transaction hash: ${result.hash.slice(0, 8)}...`,
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to send payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isWalletConnected || !walletAddress) {
    return (
      <Card className="bg-black/60 backdrop-blur-md border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-amber-200">Wallet Demo</CardTitle>
          <CardDescription className="text-stone-300">
            Connect your Freighter wallet to try out these features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-stone-400 text-sm">
            This demo allows you to sign messages and send test payments using your Stellar wallet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message Signing Demo */}
      <Card className="bg-black/60 backdrop-blur-md border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-200 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Sign Message
          </CardTitle>
          <CardDescription className="text-stone-300">
            Sign a message with your wallet to prove ownership
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-stone-300">Message to Sign</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a message to sign..."
              className="bg-black/40 border-blue-500/30 text-stone-200"
            />
          </div>
          
          <Button 
            onClick={handleSignMessage}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
            Sign Message
          </Button>

          {signedMessage && (
            <div className="space-y-2">
              <Label className="text-stone-300">Signed Message</Label>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                <p className="text-xs font-mono text-green-200 break-all">
                  {signedMessage}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Demo */}
      <Card className="bg-black/60 backdrop-blur-md border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-200 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Payment
          </CardTitle>
          <CardDescription className="text-stone-300">
            Send a test payment to another Stellar address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-stone-300">Recipient Address</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="G..."
              className="bg-black/40 border-green-500/30 text-stone-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-stone-300">Amount (XLM)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1"
              min="0.0000001"
              step="0.0000001"
              className="bg-black/40 border-green-500/30 text-stone-200"
            />
          </div>

          <Button 
            onClick={handleSendPayment}
            disabled={loading || !recipient || !amount}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send Payment
          </Button>

          {txHash && (
            <div className="space-y-2">
              <Label className="text-stone-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Transaction Hash
              </Label>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                <p className="text-xs font-mono text-green-200 break-all">
                  {txHash}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 