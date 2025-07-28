'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [activeWitness, setActiveWitness] = useState<string>('');
  const [partnerNotifications, setPartnerNotifications] = useState<Array<{id: number, message: string}>>([]);

  // Witness Eye Component - bezpieczna implementacja
  const WitnessEye = ({ witness }: { witness: string }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="fixed top-20 right-5 bg-red-100 border-2 border-red-500 rounded-full p-4 z-50 animate-pulse"
    >
      <div className="text-center">
        <Eye className="h-8 w-8 text-red-600 mx-auto" />
        <div className="text-xs mt-1">{witness}</div>
      </div>
    </motion.div>
  );

  // Partner Notification Component - bezpieczna implementacja
  const PartnerNotification = ({ notification }: { notification: { id: number, message: string } }) => (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-20 right-4 bg-blue-100 border-2 border-blue-500 rounded-lg p-4 shadow-lg max-w-sm"
    >
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-blue-600 flex-shrink-0" />
        <p className="text-sm">{notification.message}</p>
      </div>
    </motion.div>
  );

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
    
    // Pokaż "oko" w rogu ekranu - bezpieczna implementacja
    setActiveWitness(randomWitness);
    
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
    const partnerMessages: { [key: string]: string[] } = {
      'Motywator Max': [
        'Max: "Świetnie Ci idzie! Jeszcze jedno zadanie?"',
        'Max: "Każde małe zadanie to krok do sukcesu!"',
        'Max: "Pamiętaj - liczy się postęp, nie perfekcja"',
        'Max: "Wow, twój streak rośnie! Tak trzymaj!"',
        'Max: "Czas na przerwę? 5 minut i wracamy do akcji!"'
      ],
      'Surowa Sara': [
        'Sara: "Przestań prokrastynować. Do roboty."',
        'Sara: "Ile zadań dzisiaj? Mam nadzieję że więcej niż wczoraj."',
        'Sara: "Bez wymówek. Działaj."',
        'Sara: "Konkurencja nie śpi. Ty też nie powinieneś."',
        'Sara: "Mniej planowania, więcej działania. TERAZ."'
      ],
      'Przyjaciel Piotr': [
        'Piotr: "Hej, jak Ci idzie? Potrzebujesz pomocy?"',
        'Piotr: "Pamiętaj żeby zrobić przerwę na kawę ☕"',
        'Piotr: "Super że się starasz! Dumny jestem"',
        'Piotr: "Może razem popracujemy? Razem raźniej!"',
        'Piotr: "Nie przejmuj się jeśli coś nie wyszło, jutro nowy dzień"'
      ],
      'Trener Tom': [
        'Tom: "10 pompek między zadaniami = lepsza koncentracja!"',
        'Tom: "Technika Pomodoro: 25 min pracy, 5 min ruchu"',
        'Tom: "Wyprostuj plecy! Produktywność zaczyna się od postawy"',
        'Tom: "Cel na dziś: pobić wczorajszy rekord o 1 zadanie"',
        'Tom: "Pamiętaj o wodzie! Nawodnienie = koncentracja"'
      ]
    };
    
    const partnerActions = partnerMessages[partnerId] || [
      `${partnerId}: "Trzymam za Ciebie kciuki!"`,
      `${partnerId}: "Jak postępy?"`,
      `${partnerId}: "Nie poddawaj się!"`,
      `${partnerId}: "Jestem z Tobą!"`,
      `${partnerId}: "Dasz radę!"`
    ];
    
    // Losowe powiadomienia od partnera
    const showPartnerPressure = () => {
      const message = partnerActions[Math.floor(Math.random() * partnerActions.length)];
      
      // Dodaj powiadomienie do stanu
      const newNotification = {
        id: Date.now(),
        message: message
      };
      
      setPartnerNotifications(prev => [...prev, newNotification]);
      
      // Usuń po 5 sekundach
      setTimeout(() => {
        setPartnerNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
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
              Ustaw wirtualnego partnera motywacyjnego
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => connectAccountabilityPartner('Motywator Max')}
              >
                Motywator Max
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => connectAccountabilityPartner('Surowa Sara')}
              >
                Surowa Sara
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => connectAccountabilityPartner('Przyjaciel Piotr')}
              >
                Przyjaciel Piotr
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => connectAccountabilityPartner('Trener Tom')}
              >
                Trener Tom
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Wybierz wirtualnego partnera, który będzie Cię motywował
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm">Twój partner: <strong>{accountabilityPartner}</strong></p>
            <div className="text-xs text-muted-foreground">
              • Śledzi Twoje postępy<br/>
              • Wysyła motywujące wiadomości<br/>
              • Przypomina o zadaniach
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAccountabilityPartner('')}
            >
              Zmień partnera
            </Button>
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

      {/* Bezpieczne renderowanie witness eye przez React Portal */}
      {witnessMode && activeWitness && typeof document !== 'undefined' && (
        createPortal(
          <AnimatePresence>
            <WitnessEye witness={activeWitness} />
          </AnimatePresence>,
          document.body
        )
      )}

      {/* Bezpieczne renderowanie partner notifications przez React Portal */}
      {partnerNotifications.length > 0 && typeof document !== 'undefined' && (
        createPortal(
          <AnimatePresence>
            {partnerNotifications.map(notification => (
              <PartnerNotification key={notification.id} notification={notification} />
            ))}
          </AnimatePresence>,
          document.body
        )
      )}
    </div>
  );
}