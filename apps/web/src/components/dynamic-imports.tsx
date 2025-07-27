// Dynamic imports for performance optimization
import dynamic from 'next/dynamic';

// Heavy animation library - load only when needed
export const DynamicConfetti = dynamic(() => import('react-confetti'), {
  ssr: false,
  loading: () => null,
});

// Drag and drop library - load only on dashboard
export const DynamicDragDropWrapper = dynamic(
  () => import('@/components/drag-drop-wrapper').then(mod => ({ default: mod.DragDropWrapper })),
  { ssr: false }
);

export const DynamicDragDropContext = dynamic(
  () => import('@/components/drag-drop-wrapper').then(mod => ({ default: mod.DragDropContext })),
  { ssr: false }
);

export const DynamicDroppable = dynamic(
  () => import('@/components/drag-drop-wrapper').then(mod => ({ default: mod.Droppable })),
  { ssr: false }
);

export const DynamicDraggable = dynamic(
  () => import('@/components/drag-drop-wrapper').then(mod => ({ default: mod.Draggable })),
  { ssr: false }
);

// Heavy modals - load on demand
export const DynamicFutureSelfModal = dynamic(() => import('@/components/future-self-modal').then(mod => ({ default: mod.FutureSelfModal })), {
  ssr: false,
  loading: () => null,
});

export const DynamicWeeklyReviewModal = dynamic(() => import('@/components/weekly-review-modal').then(mod => ({ default: mod.WeeklyReviewModal })), {
  ssr: false,
  loading: () => null,
});

export const DynamicSelfCompassionModal = dynamic(() => import('@/components/self-compassion-modal').then(mod => ({ default: mod.SelfCompassionModal })), {
  ssr: false,
  loading: () => null,
});

// Implementation components - load when visible
export const DynamicImplementationIntentions = dynamic(() => import('@/components/implementation-intentions').then(mod => ({ default: mod.ImplementationIntentions })), {
  ssr: false,
});

export const DynamicCommitmentContract = dynamic(() => import('@/components/commitment-contract').then(mod => ({ default: mod.CommitmentContract })), {
  ssr: false,
});

export const DynamicEnvironmentalPriming = dynamic(() => import('@/components/environmental-priming').then(mod => ({ default: mod.EnvironmentalPriming })), {
  ssr: false,
});

export const DynamicCueScheduler = dynamic(() => import('@/components/cue-scheduler').then(mod => ({ default: mod.CueScheduler })), {
  ssr: false,
});

export const DynamicLootbox = dynamic(() => import('@/components/lootbox').then(mod => ({ default: mod.Lootbox })), {
  ssr: false,
});

// AI Features - load when needed
export const DynamicProgressStory = dynamic(() => import('@/components/features/ProgressStory').then(mod => ({ default: mod.ProgressStory })), {
  ssr: false,
});

export const DynamicEmotionInterventions = dynamic(() => import('@/components/features/EmotionInterventions').then(mod => ({ default: mod.EmotionInterventions })), {
  ssr: false,
});

export const DynamicTaskPriorityAdvisor = dynamic(() => import('@/components/features/TaskPriorityAdvisor').then(mod => ({ default: mod.TaskPriorityAdvisor })), {
  ssr: false,
});

// Behavioral Interventions
export const DynamicBehavioralInterventions = dynamic(() => import('@/components/behavioral-interventions').then(mod => ({ default: mod.BehavioralInterventions })), {
  ssr: false,
});

export const DynamicPreemptiveStrike = dynamic(() => import('@/components/preemptive-strike').then(mod => ({ default: mod.PreemptiveStrike })), {
  ssr: false,
});

export const DynamicSocialAccountability = dynamic(() => import('@/components/social-accountability').then(mod => ({ default: mod.SocialAccountability })), {
  ssr: false,
});

export const DynamicPhysicalIntegration = dynamic(() => import('@/components/physical-integration').then(mod => ({ default: mod.PhysicalIntegration })), {
  ssr: false,
});

export const DynamicInteractiveHints = dynamic(() => import('@/components/interactive-hints').then(mod => ({ default: mod.InteractiveHints })), {
  ssr: false,
});

// FAQ Section for homepage
export const DynamicFAQSection = dynamic(() => import('@/components/faq-section').then(mod => ({ default: mod.FAQSection })), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 rounded mb-4"></div>
    </div>
  ),
});