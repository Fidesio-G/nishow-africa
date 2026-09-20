const photos = [
  {
    src: './assets/gallery/web3js.jpg',
    alt: 'An attendee listening during a Web3 JS Africa session',
    caption: 'Listening closely',
    source: 'Web3 JS Africa, Catholic University · 2024',
    position: 'center'
  },
  {
    src: './assets/gallery/patagonia.jpg',
    alt: 'Builders speaking outdoors during the Lisk residency in Patagonia',
    caption: 'Building in the open',
    source: 'Lisk residency, Edge City Patagonia, Argentina · 2025',
    position: 'center'
  },
  {
    src: './assets/gallery/lisk.jpg',
    alt: 'A participant speaking on camera during a Lisk Nairobi production',
    caption: 'Behind the story',
    source: 'Lisk Nairobi',
    position: 'center'
  },
  {
    src: './assets/gallery/ethiopia-trip.jpg',
    alt: 'Three women posing together during a field trip in Ethiopia',
    caption: 'People along the way',
    source: 'Nishow field trip, Ethiopia',
    position: 'center'
  },
  {
    src: './assets/gallery/ethiopia-tech.jpg',
    alt: 'Three builders in conversation at the ETHiopia technology event',
    caption: 'Ideas in motion',
    source: 'ETHiopia technology event, Addis Ababa',
    position: 'center'
  },
  {
    src: './assets/gallery/ethsafari.jpg',
    alt: 'A woman speaking to an audience at ETHSafari',
    caption: 'On the floor',
    source: 'ETHSafari · 2024',
    position: 'center'
  },
  {
    src: './assets/gallery/africa-tech-connect.jpg',
    alt: 'A guest trying a virtual reality headset at Africa Tech Connect',
    caption: 'Trying the future',
    source: 'Africa Tech Connect',
    position: 'center'
  },
  {
    src: './assets/gallery/get-onboard.jpg',
    alt: 'A participant spinning a prize wheel at Get Onboard',
    caption: 'A moment of play',
    source: 'Get Onboard, Kenyatta University',
    position: 'center'
  },
  {
    src: './assets/gallery/somali-night.jpg',
    alt: 'Two guests smiling together at the Somali Night Awards',
    caption: 'A night to remember',
    source: 'Somali Night Awards',
    position: 'center'
  }
];

const tilts = [-3, 2, -2, 3, -1, 2, -3, 1, -2];
const track = document.querySelector('#photo-track');
const strip = document.querySelector('#photo-strip');
const dialog = document.querySelector('#photo-dialog');
const viewerImage = document.querySelector('#viewer-image');
const viewerCaption = document.querySelector('#viewer-caption');
const viewerSource = document.querySelector('#viewer-source');
let selected = 0;

function viewPhoto(index) {
  selected = (index + photos.length) % photos.length;
  const photo = photos[selected];
  viewerImage.src = photo.src;
  viewerImage.alt = photo.alt;
  viewerCaption.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')} · ${photo.caption}`;
  viewerSource.textContent = `From ${photo.source}`;
}

for (let group = 0; group < 3; group += 1) {
  const row = document.createElement('div');
  row.className = 'photo-group';

  if (group > 0) {
    row.setAttribute('aria-hidden', 'true');
  }

  photos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.className = 'photo-card';
    button.style.setProperty('--tilt', `${tilts[index]}deg`);
    button.setAttribute('aria-label', `View ${photo.caption} from ${photo.source}`);

    if (group > 0) {
      button.tabIndex = -1;
    }

    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = photo.alt;
    image.style.objectPosition = photo.position;
    image.draggable = false;
    image.loading = group === 0 && index < 3 ? 'eager' : 'lazy';

    const label = document.createElement('span');
    label.textContent = photo.caption;
    button.append(image, label);
    button.addEventListener('click', () => {
      viewPhoto(index);
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });
    row.append(button);
  });

  track.append(row);
}

function closeViewer() {
  dialog.close();
}

dialog.addEventListener('close', () => {
  document.body.style.overflow = '';
});
document.querySelector('.viewer-close').addEventListener('click', closeViewer);
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    closeViewer();
  }
});
document.querySelector('#viewer-prev').addEventListener('click', () => viewPhoto(selected - 1));
document.querySelector('#viewer-next').addEventListener('click', () => viewPhoto(selected + 1));
dialog.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    viewPhoto(selected + (event.key === 'ArrowRight' ? 1 : -1));
  }
});

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const toggle = document.querySelector('#motion-toggle');
let paused = motion.matches;
let hovered = false;
let focused = false;
let touching = false;
let last = 0;
let visible = true;

function updateMotionLabel() {
  toggle.textContent = paused ? 'Resume motion ▶' : 'Pause motion Ⅱ';
  toggle.setAttribute('aria-pressed', String(paused));
}

updateMotionLabel();
toggle.addEventListener('click', () => {
  paused = !paused;
  updateMotionLabel();
});
motion.addEventListener('change', (event) => {
  paused = event.matches;
  updateMotionLabel();
});
strip.addEventListener('pointerenter', (event) => {
  if (event.pointerType === 'mouse') {
    hovered = true;
  }
});
strip.addEventListener('pointerleave', () => {
  hovered = false;
});
strip.addEventListener('focusin', () => {
  focused = true;
});
strip.addEventListener('focusout', (event) => {
  focused = strip.contains(event.relatedTarget);
});
strip.addEventListener('touchstart', () => {
  touching = true;
}, { passive: true });
strip.addEventListener('touchend', () => {
  setTimeout(() => {
    touching = false;
  }, 2500);
}, { passive: true });
strip.addEventListener('touchcancel', () => {
  touching = false;
}, { passive: true });

new IntersectionObserver((entries) => {
  visible = entries[0].isIntersecting;
}).observe(strip);

function animate(timestamp) {
  const delta = Math.min(timestamp - last, 40);
  last = timestamp;

  if (!paused && !hovered && !focused && !touching && !dialog.open && visible && !document.hidden) {
    strip.scrollLeft += delta * 0.05;
    const width = track.firstElementChild.getBoundingClientRect().width;
    if (strip.scrollLeft >= width) {
      strip.scrollLeft -= width;
    }
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

document.querySelectorAll('.video-cover').forEach((button) => {
  button.addEventListener('click', () => {
    const player = button.parentElement;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${player.dataset.video}?autoplay=1&rel=0`;
    frame.title = player.dataset.title;
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    player.replaceChildren(frame);
    frame.focus();
  });
});
