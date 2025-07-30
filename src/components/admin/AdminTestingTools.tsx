import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuraCoinTest } from '@/components/AuraCoinTest';
import { AuraCoinSystemTest } from '@/components/AuraCoinSystemTest';
import { TestTube } from 'lucide-react';

export const AdminTestingTools = () => {
  return (
    <Card className="bg-black/60 backdrop-blur-md border-amber-500/30 text-stone-300 shadow-xl shadow-amber-500/10">
      <CardHeader>
        <CardTitle className="text-amber-200 font-pixel tracking-wider flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Testing Tools
          <Badge variant="secondary" className="ml-auto bg-amber-500/20 text-amber-200">
            Admin Only
          </Badge>
        </CardTitle>
        <CardDescription className="text-amber-400/70">
          Contract testing and system verification tools
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="contract" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-stone-800/50">
            <TabsTrigger value="contract" className="data-[state=active]:bg-amber-500/20">
              Contract Tests
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-amber-500/20">
              System Tests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contract" className="mt-6">
            <AuraCoinTest />
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <AuraCoinSystemTest />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};