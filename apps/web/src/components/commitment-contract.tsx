// path: apps/web/src/components/commitment-contract.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@dopaforge/ui';
import { Shield, AlertCircle, Calendar, Users } from 'lucide-react';
import type { Database } from '@dopaforge/db';

type CommitmentContract = Database['public']['Tables']['commitment_contracts']['Row'];

interface CommitmentContractProps {
  contracts: CommitmentContract[];
  onCreateContract: (contract: {
    goal: string;
    stake_type: 'social' | 'donation' | 'habit_lock';
    stake_details: any;
    deadline: string;
    accountability_partner?: string;
  }) => Promise<void>;
  onUpdateStatus: (id: string, status: 'completed' | 'failed') => Promise<void>;
}

export function CommitmentContract({
  contracts,
  onCreateContract,
  onUpdateStatus,
}: CommitmentContractProps) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState('');
  const [stakeType, setStakeType] = useState<'social' | 'donation' | 'habit_lock'>('social');
  const [deadline, setDeadline] = useState('');
  const [accountabilityPartner, setAccountabilityPartner] = useState('');
  const [stakeDetails, setStakeDetails] = useState({
    message: '',
    amount: 0,
    lockedHabit: '',
  });

  const activeContracts = contracts.filter(c => c.status === 'active');
  const pastContracts = contracts.filter(c => c.status !== 'active');

  const handleSubmit = async () => {
    await onCreateContract({
      goal,
      stake_type: stakeType,
      stake_details: {
        ...(stakeType === 'social' && { message: stakeDetails.message }),
        ...(stakeType === 'donation' && { amount: stakeDetails.amount }),
        ...(stakeType === 'habit_lock' && { lockedHabit: stakeDetails.lockedHabit }),
      },
      deadline,
      accountability_partner: accountabilityPartner || undefined,
    });
    
    setOpen(false);
    setGoal('');
    setDeadline('');
    setAccountabilityPartner('');
    setStakeDetails({ message: '', amount: 0, lockedHabit: '' });
  };

  const getStakeIcon = (type: string) => {
    switch (type) {
      case 'social':
        return Users;
      case 'donation':
        return Shield;
      case 'habit_lock':
        return AlertCircle;
      default:
        return Shield;
    }
  };

  const formatStake = (type: string, details: any) => {
    switch (type) {
      case 'social':
        return `Social: "${details.message}"`;
      case 'donation':
        return `Donation: $${details.amount}`;
      case 'habit_lock':
        return `Locked: ${details.lockedHabit}`;
      default:
        return 'Unknown stake';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Commitment Contracts
        </CardTitle>
        <CardDescription>
          Put skin in the game to boost motivation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mb-4">
              Create New Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create Commitment Contract</DialogTitle>
              <DialogDescription>
                Set a goal and choose what's at stake if you don't complete it
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Goal</Label>
                <Textarea
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="What do you commit to achieving?"
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stake">What's at stake?</Label>
                <Select value={stakeType} onValueChange={(v: any) => setStakeType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Shame</SelectItem>
                    <SelectItem value="donation">Charity Donation</SelectItem>
                    <SelectItem value="habit_lock">Habit Lock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {stakeType === 'social' && (
                <div className="space-y-2">
                  <Label htmlFor="message">Public message if you fail</Label>
                  <Textarea
                    id="message"
                    value={stakeDetails.message}
                    onChange={(e) => setStakeDetails({ ...stakeDetails, message: e.target.value })}
                    placeholder="I failed to... and I'm disappointed in myself"
                    className="resize-none"
                  />
                </div>
              )}

              {stakeType === 'donation' && (
                <div className="space-y-2">
                  <Label htmlFor="amount">Donation amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={stakeDetails.amount}
                    onChange={(e) => setStakeDetails({ ...stakeDetails, amount: parseInt(e.target.value) })}
                    min="1"
                    placeholder="25"
                  />
                </div>
              )}

              {stakeType === 'habit_lock' && (
                <div className="space-y-2">
                  <Label htmlFor="habit">Habit to lock</Label>
                  <Input
                    id="habit"
                    value={stakeDetails.lockedHabit}
                    onChange={(e) => setStakeDetails({ ...stakeDetails, lockedHabit: e.target.value })}
                    placeholder="e.g., Netflix, Gaming, Social Media"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="partner">Accountability Partner (optional)</Label>
                <Input
                  id="partner"
                  type="email"
                  value={accountabilityPartner}
                  onChange={(e) => setAccountabilityPartner(e.target.value)}
                  placeholder="partner@example.com"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={!goal || !deadline}
                variant="gradient"
              >
                Create Contract
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-3">
          {activeContracts.length === 0 && pastContracts.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              No contracts yet. Create one to boost commitment!
            </p>
          ) : (
            <>
              {activeContracts.map((contract) => {
                const Icon = getStakeIcon(contract.stake_type);
                const daysLeft = Math.ceil(
                  (new Date(contract.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{contract.goal}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatStake(contract.stake_type, contract.stake_details)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className={`text-xs ${daysLeft <= 3 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {daysLeft} days left
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(contract.id, 'completed')}
                        className="flex-1"
                      >
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateStatus(contract.id, 'failed')}
                        className="text-red-600"
                      >
                        Failed
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
              
              {pastContracts.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Past contracts</p>
                  {pastContracts.slice(0, 3).map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between py-1">
                      <p className="text-xs truncate">{contract.goal}</p>
                      <span className={`text-xs ${contract.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                        {contract.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}