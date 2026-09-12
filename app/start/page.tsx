'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

/* import all the icons in Free Solid, Free Regular, and Brands styles */
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'



type Feeling = 'fine' | 'happy' | 'sad' | 'excited';
type DateIdea = 'Artsy' | 'Eat Out' | 'Physical' | 'Custom';
type Step = 'feeling' | 'dateIdea' | 'calendar' | 'confirmation' | 'done';
type IntroPhase = 'hello' | 'korean' | 'intro';

const feelings: Array<{ value: Feeling; label: string; icon: IconDefinition; note: string }> = [
  { value: 'fine', label: 'Fine', icon: fas.faFaceLaugh, note: 'I feel fine' },
  { value: 'happy', label: 'Happy', icon: fas.faFaceLaughBeam, note: 'I feel happy' },
  { value: 'sad', label: 'Sad', icon: fas.faFaceFrown, note: 'I am sad' },
  { value: 'excited', label: 'Excited', icon: fas.faFaceGrinSquint, note: "I am excited" },
];

const dateIdeas: Array<{ value: DateIdea; label: string; note: string; icon: IconDefinition }> = [
  { value: 'Artsy', label: 'Artsy', note: 'Gallery, pottery, or a creative workshop', icon: fas.faPalette },
  { value: 'Eat Out', label: 'Eat out', note: 'A new restaurant, cafe hopping, or food market', icon: fas.faUtensils },
  { value: 'Physical', label: 'Physical', note: 'An amusement park or an afternoon out', icon: fas.faPuzzlePiece },
  { value: 'Custom', label: 'Suggest!', note: 'Share your ideas!', icon: fas.faHeartCirclePlus },
];

const timeSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '1:00 PM', '2:00 PM'];
const stepLabels = ['Mood', 'Idea', 'When', 'Confirm'];

function getMonthDays(date: Date) {
  return {
    daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
    firstDay: new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
  };
}

function formatDate(date: Date | null) {
  return date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function Home() {
  const [step, setStep] = useState<Step>('feeling');
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [dateIdea, setDateIdea] = useState<DateIdea | null>(null);
  const [customIdea, setCustomIdea] = useState('');
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [pendingDateIdea, setPendingDateIdea] = useState<DateIdea | null>(null);
  const [dateLocation, setDateLocation] = useState('');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [today, setToday] = useState<Date | null>(null);
  const [introPhase, setIntroPhase] = useState<IntroPhase>('hello');
  const [hasStarted, setHasStarted] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setToday(new Date()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const koreanTimer = window.setTimeout(() => setIntroPhase('korean'), 3000);
    const introTimer = window.setTimeout(() => setIntroPhase('intro'), 4800);

    return () => {
      window.clearTimeout(koreanTimer);
      window.clearTimeout(introTimer);
    };
  }, []);

  const currentDate = today ?? new Date(2026, 8, 8);
  const visibleMonth = calendarMonth ?? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const { daysInMonth, firstDay } = getMonthDays(visibleMonth);
  const monthName = visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastMonth = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1);
  const canGoPrevious = visibleMonth > firstMonth;
  const canGoNext = visibleMonth < lastMonth;
  const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const lastDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
  const activeStep = step === 'done' ? 4 : ['feeling', 'dateIdea', 'calendar', 'confirmation'].indexOf(step);

  const chooseIdea = (value: DateIdea) => {
    if (value === 'Custom') {
      setIsCustomOpen(true);
      return;
    }
    setPendingDateIdea(value);
    setDateLocation('');
    setIsLocationOpen(true);
  };

  const continueWithLocation = (location: string) => {
    if (!pendingDateIdea) return;
    setDateIdea(pendingDateIdea);
    setDateLocation(location.trim());
    setPendingDateIdea(null);
    setIsLocationOpen(false);
    setStep('calendar');
  };

  const chooseCustomIdea = () => {
    if (!customIdea.trim()) return;
    setPendingDateIdea('Custom');
    setDateLocation('');
    setIsCustomOpen(false);
    setIsLocationOpen(true);
  };

  const sendDate = async () => {
    if (!email.trim()) return;

    const response = await fetch('/api/send-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        feeling: feelings.find((item) => item.value === feeling)?.label,
        dateIdea,
        customIdea,
        dateLocation,
        date: formatDate(date),
        time,
      }),
    });

    if (!response.ok) {
      throw new Error('Email failed to send');
    }

    setIsEmailOpen(false);
    setStep('done');
  };

  if (!today) {
    return <main className="planner-page planner-loading" aria-label="Loading date planner" />;
  }

  if (!hasStarted) {
    return (
      <main className={`welcome-screen welcome-phase-${introPhase}`} aria-live="polite">
        {introPhase === 'hello' && <div className="greeting-frame"><h1>Hello, Dorothy<span>!</span></h1></div>}
        {introPhase === 'korean' && <div className="greeting-frame"><h1>안녕<span>!</span></h1></div>}
        {introPhase === 'intro' && <div className="welcome-intro intro-frame">
          <p className="eyebrow">A small plan for a good day</p>
          <h1>Let&apos;s make room for <em>something nice.</em></h1>
          <p>Answer four tiny questions and we&apos;ll turn a feeling into a plan.</p>
          <button className="start-button" onClick={() => setHasStarted(true)}><span className="start-label">Start</span></button>
        </div>}
      </main>
    );
  }

  if (step === 'done') {
    return (
      <main className="planner-page planner-page-centered">
        <section className="success-card">
          <span className="success-mark">✓</span>
          <p className="eyebrow">It&apos;s a date</p>
          <h1>See you!</h1>
          <p className="supporting-copy">Expect an email from me soon ;)</p>
        </section>
      </main>
    );
  }

  return (
    <main className="planner-page">
      <header className="planner-header">
        <div className="progress-wrap">
          <span>DATE PLANNER</span>
          <div className="progress-track" aria-label={`Step ${activeStep + 1} of 4`}>
            {stepLabels.map((label, index) => <span key={label} className={index <= activeStep ? 'progress-dot is-active' : 'progress-dot'} title={label} />)}
          </div>
        </div>
      </header>

      <div className="planner-layout">
        <aside className={`intro-panel intro-phase-${introPhase}`} aria-live="polite">
          {introPhase === 'hello' && <div className="greeting-frame"><h1>Hello, Dorothy<span>!</span></h1></div>}
          {introPhase === 'korean' && <div className="greeting-frame"><h1>안녕<span>!</span></h1></div>}
          {introPhase === 'intro' && <div className="intro-frame">
            <p className="eyebrow">A small plan for a good day</p>
            <h1>Let&apos;s make room for <em>something nice.</em></h1>
            <p>Answer four tiny questions and we&apos;ll turn a feeling into a plan.</p>
            <span className="aside-number">0{activeStep + 1}</span>
          </div>}
        </aside>

        <section className="flow-panel">
          {step === 'feeling' && <>
            <p className="step-kicker">First, check in</p>
            <h2>How are you feeling today?</h2>
            <div className="choice-grid feeling-grid">
              {feelings.map((item) => <button key={item.value} className="choice-card" onClick={() => { setFeeling(item.value); setStep('dateIdea'); }}>
                <FontAwesomeIcon icon={item.icon} />
                <span className="choice-card-content">
                <strong>{item.label}</strong>
                <small>{item.note}</small>
                </span>
                <span className="card-arrow"><FontAwesomeIcon icon={faChevronRight} style={{color: "rgb(82, 79, 79)",}} /></span>
              </button>)}
            </div>
          </>}

          {step === 'dateIdea' && <>
            <button className="back-button" onClick={() => setStep('feeling')}>← Back</button>
            <p className="step-kicker">Nice! Now let&apos;s choose a direction</p>
            <h2>What kind of date sounds right?</h2>
            <div className="choice-grid idea-grid">
              {dateIdeas.map((item) => <button key={item.value} className="choice-card idea-card" onClick={() => chooseIdea(item.value)}>
                <FontAwesomeIcon icon={item.icon} />
                <span className="choice-card-content">
                <strong>{item.label}</strong>
                <small>{item.note}</small>
                </span>
                <span className="card-arrow"><FontAwesomeIcon icon={faChevronRight} style={{color: "rgb(82, 79, 79)",}} /></span>
              </button>)}
            </div>
          </>}

          {step === 'calendar' && <>
            <button className="back-button" onClick={() => setStep('dateIdea')}>← Back</button>
            <p className="step-kicker">Find the moment</p>
            <h2>When are you free?</h2>
            <div className="schedule-grid">
              <div className="calendar-panel">
                <div className="calendar-heading"><div className="month-navigation"><button type="button" onClick={() => setCalendarMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} disabled={!canGoPrevious} aria-label="Previous month">←</button><strong>{monthName}</strong><button type="button" onClick={() => setCalendarMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} disabled={!canGoNext} aria-label="Next month">→</button></div><span>Pick a day</span></div>
                <div className="weekdays">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
                <div className="calendar-days">
                  {Array.from({ length: firstDay }, (_, index) => <span key={`empty-${index}`} />)}
                  {Array.from({ length: daysInMonth }, (_, index) => {
                    const day = index + 1;
                    const nextDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
                    const isToday = nextDate.toDateString() === todayStart.toDateString();
                    const isPast = nextDate < todayStart;
                    const isAfterRange = nextDate > lastDate;
                    const isSelected = date?.toDateString() === nextDate.toDateString();
                    return <button key={day} disabled={isPast || isAfterRange} className={`${isToday ? 'is-today ' : ''}${isSelected ? 'is-selected' : ''}`} onClick={() => { setDate(nextDate); setTime(''); }}>{day}</button>;
                  })}
                </div>
              </div>
              <div className="time-panel"><div className="calendar-heading"><strong>{date ? formatDate(date) : 'Choose a day'}</strong><span>{date ? 'Choose a time' : 'Times appear here'}</span></div>{date ? <div className="time-grid">{timeSlots.map((slot) => <button key={slot} className={time === slot ? 'is-selected' : ''} onClick={() => { setTime(slot); setStep('confirmation'); }}>{slot}</button>)}</div> : <p className="time-empty">Select a date to see available times.</p>}</div>
            </div>
          </>}

          {step === 'confirmation' && <>
            <button className="back-button" onClick={() => setStep('calendar')}>← Back</button>
            <p className="step-kicker">One last look</p>
            <h2>Does this feel like you?</h2>
            <div className="summary-list"><div><span>Feeling</span><strong>{feelings.find((item) => item.value === feeling)?.label}</strong></div><div><span>The plan</span><strong>{dateIdea === 'Custom' ? customIdea : dateIdeas.find((item) => item.value === dateIdea)?.label}</strong></div><div><span>Where</span><strong>{dateLocation || 'Not specified'}</strong></div><div><span>When</span><strong>{formatDate(date)} · {time}</strong></div></div>
            <button className="primary-button" onClick={() => setIsEmailOpen(true)}>All set!<FontAwesomeIcon icon={fas.faPaperPlane}/></button>
          </>}
        </section>
      </div>

      {isCustomOpen && <div className="modal-backdrop" role="presentation">
        <div className="custom-modal" role="dialog" aria-modal="true" aria-labelledby="custom-title">
        <button className="modal-close" onClick={() => setIsCustomOpen(false)} aria-label="Close">×</button><p className="step-kicker">Make it yours</p><h2 id="custom-title">What&apos;s the plan?</h2><input autoFocus value={customIdea} onChange={(event) => setCustomIdea(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && chooseCustomIdea()} placeholder="What's on your mind?" /><button className="primary-button" onClick={chooseCustomIdea}><span>Sounds great!</span><FontAwesomeIcon icon={fas.faPaperPlane}/></button></div></div>}
      {isLocationOpen && <div className="modal-backdrop" role="presentation">
        <div className="custom-modal" role="dialog" aria-modal="true" aria-labelledby="location-title">
          <button className="modal-close" onClick={() => { setPendingDateIdea(null); setIsLocationOpen(false); }} aria-label="Close">×</button>
          <p className="step-kicker">Make it yours</p>
          <h2 id="location-title">Where do you have in mind?</h2>
          <input autoFocus value={dateLocation} onChange={(event) => setDateLocation(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && continueWithLocation(dateLocation)} placeholder="what do you have in mind?" />
          <div className="modal-actions">
            <button className="text-button" onClick={() => continueWithLocation('')}>Not sure yet</button>
            <button className="primary-button" onClick={() => continueWithLocation(dateLocation)}><span>Looks good!</span><FontAwesomeIcon icon={fas.faPaperPlane}/></button>
          </div>
        </div>
      </div>}
      {isEmailOpen && <div className="modal-backdrop" role="presentation">
        <div className="custom-modal" role="dialog" aria-modal="true" aria-labelledby="email-title">
          <button className="modal-close" onClick={() => setIsEmailOpen(false)} aria-label="Close">×</button>
          <p className="step-kicker">Almost there</p>
          <h2 id="email-title">Where should I send the details?</h2>
          <input autoFocus type="email" value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendDate()} placeholder="Your email address" required />
          <button className="primary-button" onClick={sendDate}>Send it <FontAwesomeIcon icon={fas.faPaperPlane}/></button>
        </div>
      </div>}
    </main>
  );
}
