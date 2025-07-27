# DopaForge 🧠⚡

> Transform procrastination into productivity with science-backed motivation system

DopaForge is a web application that leverages behavioral psychology and gamification to help users build sustainable habits and overcome procrastination. By breaking work into micro-tasks and providing immediate rewards, we hack your brain's dopamine system in a healthy, controlled way.

## 🚀 Features (26/26 Implemented) ✅

### Core Features
- **Micro-Task Management**: Break work into focused 5-15 minute chunks
- **Deep Work Timer**: Distraction-free focus mode with progress tracking
- **Gamification System**: XP, badges, levels, and streaks
- **Real-time Progress**: Visual feedback with progress bars and animations
- **Dark Mode**: Easy on the eyes during late-night work sessions

### Psychological Interventions
- **Future-Self Visualization**: Morning reflection on your ideal future
- **Implementation Intentions**: If-then behavioral scripts
- **Zeigarnik Smart-Resume**: Track and resume interrupted tasks
- **Commitment Contracts**: Social/donation/habit-lock stakes
- **Environmental Priming**: Time/location/event-based behavioral cues
- **Self-Compassion Meditation**: 2-minute guided sessions
- **Weekly Check-In**: Reflection and adjustment surveys
- **Variable Rewards (Lootbox)**: Random rewards to maintain engagement

### Progressive Features  
- **Progressive Disclosure**: Gradually reveal tasks to prevent overwhelm
- **Burnout Prevention**: Smart breaks and pace monitoring
- **Social Accountability**: Share goals with partners
- **PWA Mobile**: Install as app on mobile devices
- **Autosave**: Never lose progress
- **Keyboard Shortcuts**: Power user productivity
- **Rich Text & Markdown**: Flexible task formatting
- **Subtask Support**: Hierarchical task organization
- **Flow State Detection**: Track deep work sessions

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: Custom shadcn/ui components with Radix UI
- **Animations**: Framer Motion for smooth interactions
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **State Management**: React hooks + Context API
- **Authentication**: Supabase Auth with magic links
- **Monorepo**: Turborepo with pnpm workspaces

## 📋 Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase account (free tier works)

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dopaforge.git
   cd dopaforge
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
   
   Fill in your credentials (see `.env.example` for all options):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up Supabase Database**
   
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Follow the instructions in `COMPLETE_MIGRATION_GUIDE.md`
   - Create a new project
   - Once created, go to SQL Editor
   - Run the SQL from `supabase/schema.sql` to create all tables and policies

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
dopaforge/
├── apps/
│   └── web/                 # Next.js application
│       ├── src/
│       │   ├── app/        # App router pages
│       │   ├── components/ # React components
│       │   ├── hooks/      # Custom hooks
│       │   └── lib/        # Utilities
│       └── public/         # Static assets & PWA manifest
├── packages/
│   ├── db/                 # Database client & queries
│   ├── ui/                 # Shared UI components
│   └── config/             # ESLint, TypeScript configs
├── supabase/
│   └── schema.sql          # Database schema
└── turbo.json             # Turborepo configuration
```

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript checks

# Database
# To update the database schema, edit supabase/schema.sql
# Then run the SQL in your Supabase SQL Editor
```

### Building for Production

```bash
pnpm build
pnpm start
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Set environment variables (see `VERCEL_DEPLOYMENT_CHECKLIST.md`)
4. Configure build settings:
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && npm run build`
   - Install Command: `npm install`
5. Deploy!

**Important**: See `VERCEL_DEPLOYMENT_CHECKLIST.md` for complete deployment guide.

### Docker

```bash
docker build -t dopaforge .
docker run -p 3000:3000 dopaforge
```

## 🧪 Key Features Checklist

Core functionality:

- [ ] User can sign up/in with magic link
- [ ] Tasks can be created with title and time estimate
- [ ] Tasks can be reordered via drag-and-drop
- [ ] Timer starts and counts down properly
- [ ] Task completion grants XP and shows confetti
- [ ] Progress bar animates at 80%+ completion
- [ ] Dark mode toggles correctly
- [ ] Badges unlock at correct XP thresholds

Psychological features:

- [ ] Future-Self Visualization prompts in morning
- [ ] Implementation Intentions can be created
- [ ] Zeigarnik smart-resume detects tab switches
- [ ] Commitment contracts with stakes work
- [ ] Environmental priming cues trigger
- [ ] Self-compassion meditation plays
- [ ] Weekly check-in appears on Sundays
- [ ] Lootbox spins with 24h cooldown

## 📊 Core Metrics

- **Task Completion Rate**: Tasks completed / Tasks created
- **Daily Active Users**: Unique users completing ≥1 task
- **Average Streak Length**: Consecutive days with completed tasks
- **Deep Work Minutes**: Total focused time tracked

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with behavioral psychology principles from BJ Fogg's Tiny Habits
- Gamification inspired by Yu-kai Chou's Octalysis framework
- UI components adapted from shadcn/ui
- Based on research in dopamine loops and habit formation

## 🎯 Psychology Behind DopaForge

DopaForge implements evidence-based psychological interventions:

1. **Micro-habits**: Tasks broken into 5-15 minute chunks (BJ Fogg)
2. **Variable rewards**: Unpredictable rewards maintain engagement (B.F. Skinner)
3. **Implementation intentions**: If-then planning increases follow-through by 200-300%
4. **Zeigarnik effect**: Unfinished tasks create cognitive tension that aids memory
5. **Future-self continuity**: Visualization increases long-term thinking
6. **Self-compassion**: Reduces procrastination from fear of failure
7. **Environmental design**: Context cues trigger desired behaviors

---

**Remember**: Small wins compound. Start with one 5-minute task today! 🚀