'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Input } from '@dopaforge/ui';
import { Users, Eye, Share2, AlertCircle, Trophy, Flame } from 'lucide-react';
import { AddictionEngine } from '@/lib/addiction-engine';

interface SocialAccountabilityProps {
  userId: string;
  currentStreak: number;
  tasksToday: number;
}

export function SocialAccountability({ 
  userId, 
  currentStreak, 
  tasksToday 
}: SocialAccountabilityProps) {
  const [accountabilityPartner, setAccountabilityPartner] = useState<string>('');
  const [publicCommitments, setPublicCommitments] = useState<any[]>([]);
  const [witnessMode, setWitnessMode] = useState(false);
  const [shameLevel, setShameLevel] = useState(0);

  // System "Witness Mode" - ktoś patrzy
  const activateWitnessMode = () => {
    setWitnessMode(true);
    
    // Symuluj że ktoś obserwuje
    const witnesses = [
      "Marek P. obserwuje Twoje postępy",
      "Anna K. czeka aż zaczniesz",
      "3 osoby patrzą na Twój ekran",
      "Twój szef może to zobaczyć",
      "Rodzice będą rozczarowani"
    ];
    
    const randomWitness = witnesses[Math.floor(Math.random() * witnesses.length)];
    
    // Pokaż "oko" w rogu ekranu
    const eyeElement = document.createElement('div');
    eyeElement.innerHTML = `
      <div style="
        position: fixed;
        top: 80px;
        right: 20px;
        background: rgba(255,0,0,0.1);
        border: 2px solid red;
        border-radius: 50%;
        padding: 15px;
        z-index: 9999;
        animation: pulse 2s infinite;
      ">
        <div style="text-align: center;">
          👁️
          <div style="font-size: 12px; margin-top: 5px;">
            ${randomWitness}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(eyeElement);
    
    // Zwiększ produktywność gdy ktoś "patrzy"
    setTimeout(() => {
      if (tasksToday === 0) {
        setShameLevel(prev => prev + 20);
        alert("Wszyscy widzą że nic nie robisz...");
      }
    }, 30000); // Po 30 sekundach
  };

  // Public Commitment Contract
  const createPublicCommitment = async (commitment: string) => {
    const newCommitment = {
      id: Date.now(),
      text: commitment,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      witnesses: Math.floor(Math.random() * 50) + 10, // 10-60 świadków
      completed: false,
      public: true
    };
    
    setPublicCommitments([...publicCommitments, newCommitment]);
    
    // Opublikuj na "ścianie wstydu"
    const shameWall = {
      user: userId,
      commitment: commitment,
      timestamp: new Date(),
      status: 'pending'
    };
    
    localStorage.setItem('public_commitment', JSON.stringify(shameWall));
    
    // Automatyczne przypomnienia
    const reminders = [
      { time: 3600000, message: "1h minęła. Wszyscy czekają." }, // 1h
      { time: 10800000, message: "3h. Zaczynają wątpić w Ciebie." }, // 3h
      { time: 21600000, message: "6h. Porażka staje się publiczna." }, // 6h
      { time: 43200000, message: "12h. Ostatnia szansa przed WSTYDEM." } // 12h
    ];
    
    reminders.forEach(({ time, message }) => {
      setTimeout(() => {
        if (!newCommitment.completed) {
          alert(`⚠️ ${message}\n\n${newCommitment.witnesses} osób obserwuje!`);
          setShameLevel(prev => prev + 10);
        }
      }, time);
    });
  };

  // Buddy System - wzajemna presja
  const connectAccountabilityPartner = (partnerId: string) => {
    setAccountabilityPartner(partnerId);
    
    // Symuluj powiadomienia partnera
    const partnerActions = [
      `${partnerId} właśnie ukończył 3 zadania. Twoja kolej.`,
      `${partnerId} pyta: "Co dzisiaj zrobiłeś?"`,
      `${partnerId} jest rozczarowany Twoimi wynikami`,
      `${partnerId} wyprzedził Cię o 50 XP`,
      `${partnerId}: "Nie odpuszczaj, patrzę na Ciebie"`
    ];
    
    // Losowe powiadomienia od partnera
    const showPartnerPressure = () => {
      const message = partnerActions[Math.floor(Math.random() * partnerActions.length)];
      
      // Pokaż jako "wiadomość"
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 20px;
        background: #fff;
        border: 2px solid #3b82f6;
        border-radius: 10px;
        padding: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 9999;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      `;
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="font-size: 24px;">👤</div>
          <div>
            <strong>${partnerId}</strong>
            <p style="margin: 5px 0 0 0; font-size: 14px;">${message}</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => notification.remove(), 5000);
    };
    
    // Pokaż co 15-30 minut
    setInterval(showPartnerPressure, (15 + Math.random() * 15) * 60 * 1000);
  };

  // Wall of Shame / Fame
  const getWallStatus = () => {
    if (tasksToday === 0 && new Date().getHours() > 18) {
      return {
        type: 'shame',
        message: '🚫 ŚCIANA WSTYDU: Zero zadań dzisiaj',
        visibility: 'Widoczne dla wszystkich',
        consequence: 'Twój profil oznaczony jako "Nieaktywny"'
      };
    } else if (tasksToday > 5) {
      return {
        type: 'fame',
        message: '🏆 ŚCIANA SŁAWY: Champion produktywności!',
        visibility: 'Pokazuj się z dumą',
        reward: '+100 prestiżu społecznego'
      };
    }
    
    return null;
  };

  // Ranking pressure
  const [rankingPosition, setRankingPosition] = useState(0);
  const [competitorDistance, setCompetitorDistance] = useState(0);

  useEffect(() => {
    // Symuluj ranking
    const basePosition = 100 - (tasksToday * 10) - (currentStreak * 2);
    setRankingPosition(Math.max(1, basePosition));
    
    // Ktoś Cię goni
    if (rankingPosition < 50) {
      setCompetitorDistance(Math.floor(Math.random() * 5) + 1);
    }
  }, [tasksToday, currentStreak, rankingPosition]);

  return (
    <div className="space-y-4">
      {/* Witness Mode */}
      {!witnessMode && (
        <Card className="p-4 border-2 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Tryb Świadka
              </h3>
              <p className="text-sm text-muted-foreground">
                Ktoś będzie obserwował Twoje postępy
              </p>
            </div>
            <Button
              onClick={activateWitnessMode}
              variant="outline"
              className="border-blue-500 text-blue-500"
            >
              Aktywuj
            </Button>
          </div>
        </Card>
      )}

      {/* Public Commitment */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Publiczne Zobowiązanie
        </h3>
        <div className="space-y-3">
          <Input
            placeholder="Co zrobisz w ciągu 24h? (Wszyscy zobaczą)"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                createPublicCommitment(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          
          {publicCommitments.map(commitment => (
            <div 
              key={commitment.id}
              className={`p-3 rounded-lg border ${
                commitment.completed ? 'bg-green-50 border-green-500' : 
                'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{commitment.text}</p>
                  <p className="text-sm text-muted-foreground">
                    👁️ {commitment.witnesses} świadków
                  </p>
                </div>
                {!commitment.completed && (
                  <Button
                    size="sm"
                    onClick={() => {
                      commitment.completed = true;
                      setPublicCommitments([...publicCommitments]);
                      setShameLevel(Math.max(0, shameLevel - 20));
                    }}
                  >
                    Wykonane!
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Accountability Partner */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Partner Odpowiedzialności
        </h3>
        {!accountabilityPartner ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Połącz się z kimś kto będzie Cię dopingował (i zawstydzał)
            </p>
            <Input
              placeholder="Email partnera"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  connectAccountabilityPartner(e.currentTarget.value);
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm">Połączony z: <strong>{accountabilityPartner}</strong></p>
            <div className="text-xs text-muted-foreground">
              • Widzi Twoje postępy w czasie rzeczywistym<br/>
              • Otrzymuje alerty gdy prokrastynujesz<br/>
              • Może Cię publicznie zawstydzić
            </div>
          </div>
        )}
      </Card>

      {/* Ranking Pressure */}
      <Card className={`p-4 ${competitorDistance <= 2 ? 'border-2 border-orange-500 animate-pulse' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Twoja pozycja: #{rankingPosition}</h3>
            {competitorDistance > 0 && competitorDistance <= 5 && (
              <p className="text-sm text-orange-600">
                ⚠️ Ktoś jest {competitorDistance} miejsc za Tobą!
              </p>
            )}
          </div>
          <Trophy className={`h-6 w-6 ${
            rankingPosition <= 10 ? 'text-yellow-500' :
            rankingPosition <= 50 ? 'text-gray-500' :
            'text-gray-300'
          }`} />
        </div>
      </Card>

      {/* Shame Level Indicator */}
      {shameLevel > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-20 left-4 z-50"
        >
          <Card className="p-3 bg-red-50 border-red-500">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-semibold">Poziom Wstydu: {shameLevel}%</p>
                <p className="text-xs text-red-600">
                  {shameLevel > 50 ? 'Wszyscy widzą Twoją porażkę' : 'Reputacja spada...'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Wall Status */}
      {getWallStatus() && (
        <Card className={`p-4 border-2 ${
          getWallStatus()?.type === 'shame' ? 'border-red-500 bg-red-50' : 
          'border-yellow-500 bg-yellow-50'
        }`}>
          <div className="text-center">
            <p className="font-bold text-lg">{getWallStatus()?.message}</p>
            <p className="text-sm mt-1">{getWallStatus()?.visibility}</p>
            <p className="text-xs mt-2 text-muted-foreground">
              {getWallStatus()?.consequence || getWallStatus()?.reward}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}