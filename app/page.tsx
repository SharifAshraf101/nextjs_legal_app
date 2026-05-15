import { AppShell } from '@/components/AppShell';

// Single-page app: the original HTML never used real routes — it swapped
// screens by mutating innerHTML based on `currentTab`. We preserve that model
// inside <AppShell />.
export default function Page() {
  return <AppShell />;
}
