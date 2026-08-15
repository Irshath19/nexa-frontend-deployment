import { DashboardHeader } from './DashboardHeader';
import { NexaQuickAsk } from './NexaQuickAsk';
import { EmailStatsBanner } from './EmailStatsBanner';
import { ImportantEmailsWidget } from './ImportantEmailsWidget';
import { RecentEmailsList } from './RecentEmailsList';

export default function DashboardPage() {
  return (
    <div className="page-enter">
      {/* Dashboard content */}
      <div className="max-w-4xl mx-auto py-2">
        <DashboardHeader />
        <NexaQuickAsk />
        <EmailStatsBanner />

        {/* Two column layout on larger screens */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-6 lg:px-6">
          {/* Important emails — takes more space */}
          <div className="lg:col-span-3 lg:px-0 px-0">
            <ImportantEmailsWidget />
          </div>

          {/* Recent emails — sidebar column */}
          <div className="lg:col-span-2 lg:px-0 px-0">
            <RecentEmailsList />
          </div>
        </div>
      </div>
    </div>
  );
}
