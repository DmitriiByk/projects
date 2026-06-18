import { useState } from 'react'
import {
  Home,
  Search,
  Trophy,
  Wallet,
  User,
  Bell,
  Settings,
  Heart,
  Star,
  ChevronRight,
} from 'lucide-react'
import {
  Avatar,
  Badge,
  BottomTabBar,
  Button,
  Card,
  GradientPlayButton,
  IconButton,
  ProgressBar,
  SegmentedTabs,
  SectionHeader,
} from '../components/ui'
import type { TabItem } from '../components/ui'

const tabs: TabItem[] = [
  { id: 'home', label: 'Home', icon: <Home /> },
  { id: 'search', label: 'Search', icon: <Search /> },
  { id: 'top', label: 'Top', icon: <Trophy /> },
  { id: 'wallet', label: 'Wallet', icon: <Wallet /> },
  { id: 'profile', label: 'Profile', icon: <User /> },
]

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-border-subtle last:border-b-0">
      <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">
        {label}
      </p>
      <div className="flex flex-wrap gap-2 items-center">{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-extrabold text-text-tertiary uppercase tracking-widest mb-1 px-4 pt-4">
        {title}
      </h2>
      <div className="px-4">{children}</div>
    </div>
  )
}

export function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState('home')
  const [segValue, setSegValue] = useState('casino')

  return (
    <div className="pb-24">

      {/* BUTTON */}
      <Section title="Button">
        <Row label="Variants">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
        </Row>
        <Row label="Sizes — primary">
          <Button size="xs">XSmall</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
        <Row label="With icons">
          <Button variant="primary" leftIcon={<Star size={14} />}>
            Favourite
          </Button>
          <Button variant="secondary" rightIcon={<ChevronRight size={14} />}>
            Continue
          </Button>
        </Row>
        <Row label="States">
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>
            Sec Disabled
          </Button>
          <Button variant="tertiary" disabled>
            Tert Disabled
          </Button>
        </Row>
        <Row label="Full width">
          <Button fullWidth>Full Width</Button>
        </Row>
      </Section>

      {/* GRADIENT PLAY BUTTON */}
      <Section title="GradientPlayButton">
        <Row label="Sizes">
          <GradientPlayButton size="sm" />
          <GradientPlayButton size="md" />
        </Row>
        <Row label="Custom label + disabled">
          <GradientPlayButton label="JOIN NOW" size="md" />
          <GradientPlayButton label="PLAY" size="md" disabled />
        </Row>
      </Section>

      {/* BADGE */}
      <Section title="Badge">
        <Row label="Variants — xs">
          <Badge variant="brand">Brand</Badge>
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="category">Sport</Badge>
          <Badge variant="category">Casino</Badge>
          <Badge variant="category">Promo</Badge>
        </Row>
        <Row label="Size sm">
          <Badge variant="brand" size="sm">Brand SM</Badge>
          <Badge variant="neutral" size="sm">Neutral SM</Badge>
          <Badge variant="accent" size="sm">Accent SM</Badge>
        </Row>
      </Section>

      {/* CARD */}
      <Section title="Card">
        <Row label="Paddings">
          <Card padding="sm" className="text-sm text-text-secondary">
            Padding sm
          </Card>
          <Card padding="md" className="text-sm text-text-secondary">
            Padding md
          </Card>
          <Card padding="lg" className="text-sm text-text-secondary">
            Padding lg
          </Card>
        </Row>
        <Row label="Clickable card">
          <Card
            padding="md"
            className="flex-1"
            onClick={() => alert('Card clicked!')}
          >
            <p className="text-sm font-semibold text-text-primary">Click me</p>
            <p className="text-xs text-text-secondary mt-0.5">This card is interactive</p>
          </Card>
        </Row>
      </Section>

      {/* AVATAR */}
      <Section title="Avatar">
        <Row label="Sizes">
          <Avatar initials="AB" size="sm" />
          <Avatar initials="CD" size="md" />
          <Avatar initials="EF" size="lg" />
        </Row>
        <Row label="With image">
          <Avatar
            src="https://api.dicebear.com/7.x/thumbs/svg?seed=Felix"
            alt="Felix"
            size="sm"
          />
          <Avatar
            src="https://api.dicebear.com/7.x/thumbs/svg?seed=Aneka"
            alt="Aneka"
            size="md"
          />
          <Avatar
            src="https://api.dicebear.com/7.x/thumbs/svg?seed=Luna"
            alt="Luna"
            size="lg"
          />
        </Row>
        <Row label="Online indicator">
          <Avatar initials="JD" size="sm" online />
          <Avatar initials="MK" size="md" online />
          <Avatar initials="LS" size="lg" online />
        </Row>
      </Section>

      {/* ICON BUTTON */}
      <Section title="IconButton">
        <Row label="Ghost — sizes">
          <IconButton aria-label="Bell notification" size="sm" variant="ghost">
            <Bell />
          </IconButton>
          <IconButton aria-label="Settings" size="md" variant="ghost">
            <Settings />
          </IconButton>
          <IconButton aria-label="Heart" size="lg" variant="ghost">
            <Heart />
          </IconButton>
        </Row>
        <Row label="Filled — sizes">
          <IconButton aria-label="Bell notification filled" size="sm" variant="filled">
            <Bell />
          </IconButton>
          <IconButton aria-label="Settings filled" size="md" variant="filled">
            <Settings />
          </IconButton>
          <IconButton aria-label="Heart filled" size="lg" variant="filled">
            <Heart />
          </IconButton>
        </Row>
        <Row label="Square shape">
          <IconButton aria-label="Bell square" shape="square" variant="ghost">
            <Bell />
          </IconButton>
          <IconButton aria-label="Settings square filled" shape="square" variant="filled">
            <Settings />
          </IconButton>
        </Row>
        <Row label="Disabled">
          <IconButton aria-label="Disabled" disabled variant="ghost">
            <Bell />
          </IconButton>
          <IconButton aria-label="Disabled filled" disabled variant="filled">
            <Settings />
          </IconButton>
        </Row>
      </Section>

      {/* SECTION HEADER */}
      <Section title="SectionHeader">
        <Row label="With see-all">
          <div className="w-full">
            <SectionHeader title="Top Casinos" onSeeAll={() => {}} />
          </div>
        </Row>
        <Row label="Title only">
          <div className="w-full">
            <SectionHeader title="Featured Games" />
          </div>
        </Row>
      </Section>

      {/* SEGMENTED TABS */}
      <Section title="SegmentedTabs">
        <Row label="3 options">
          <SegmentedTabs
            value={segValue}
            onChange={setSegValue}
            options={[
              { value: 'casino', label: 'Casino' },
              { value: 'sport', label: 'Sport' },
              { value: 'promo', label: 'Promo' },
            ]}
          />
        </Row>
        <Row label="Many options (scrollable)">
          <SegmentedTabs
            value={segValue}
            onChange={setSegValue}
            options={[
              { value: 'casino', label: 'Casino' },
              { value: 'sport', label: 'Sport' },
              { value: 'promo', label: 'Promo' },
              { value: 'live', label: 'Live' },
              { value: 'slots', label: 'Slots' },
              { value: 'poker', label: 'Poker' },
            ]}
          />
        </Row>
      </Section>

      {/* PROGRESS BAR */}
      <Section title="ProgressBar">
        <Row label="Values">
          <div className="w-full flex flex-col gap-3">
            <ProgressBar value={25} label="25%" showValue />
            <ProgressBar value={60} label="60%" showValue />
            <ProgressBar value={90} label="90%" showValue />
            <ProgressBar value={0} label="Empty" showValue />
            <ProgressBar value={100} label="Full" showValue />
          </div>
        </Row>
        <Row label="No label">
          <div className="w-full">
            <ProgressBar value={45} />
          </div>
        </Row>
      </Section>

      {/* BOTTOM TAB BAR */}
      <Section title="BottomTabBar">
        <Row label="Preview (not fixed)">
          <div className="w-full rounded-2xl overflow-hidden border border-border">
            <BottomTabBar
              items={tabs}
              activeId={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </Row>
      </Section>

      {/* Fixed BottomTabBar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[375px]">
        <BottomTabBar items={tabs} activeId={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  )
}
