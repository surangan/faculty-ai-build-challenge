const filters = document.querySelectorAll('.filter');
const ideaCards = document.querySelectorAll('.idea-card');

filters.forEach(filter => {
  filter.addEventListener('click', () => {
    filters.forEach(f => f.classList.remove('active'));
    filter.classList.add('active');
    const selected = filter.dataset.filter;

    ideaCards.forEach(card => {
      const category = card.dataset.category;
      const visible = selected === 'all' || category === selected || category === 'all';
      card.classList.toggle('hidden', !visible);
    });
  });
});

document.querySelectorAll('.copy-button').forEach(button => {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy);
    const text = target.innerText;
    let copied = false;

    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      const writeFromCopyEvent = event => {
        event.clipboardData.setData('text/plain', text);
        event.preventDefault();
      };
      document.addEventListener('copy', writeFromCopyEvent);
      copied = document.execCommand('copy');
      document.removeEventListener('copy', writeFromCopyEvent);
    }

    if (!copied) {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      fallback.setAttribute('readonly', '');
      fallback.style.position = 'fixed';
      fallback.style.left = '-9999px';
      document.body.appendChild(fallback);
      fallback.focus();
      fallback.select();
      fallback.setSelectionRange(0, fallback.value.length);
      copied = document.execCommand('copy');
      fallback.remove();
    }

    if (!copied) {
      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }

    const old = button.innerText;
    button.innerText = copied ? 'Copied' : 'Selected';
    setTimeout(() => button.innerText = old, 1400);
  });
});

let selectedMinutes = Number(document.querySelector('.mode-button.active')?.dataset.minutes) || 55;
let remainingSeconds = selectedMinutes * 60;
let timerId = null;

const display = document.getElementById('timerDisplay');
const message = document.getElementById('timerMessage');
const modeButtons = document.querySelectorAll('.mode-button');

function renderTimer() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (remainingSeconds <= 300 && remainingSeconds > 0) {
    message.textContent = 'Five-minute warning: finish the demo path and publish your link.';
  } else if (remainingSeconds === 0) {
    message.textContent = 'Time. Submit the link and prepare to share.';
  }
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

modeButtons.forEach(button => {
  button.addEventListener('click', () => {
    stopTimer();
    modeButtons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    selectedMinutes = Number(button.dataset.minutes);
    remainingSeconds = selectedMinutes * 60;
    message.textContent = 'Ready when you are.';
    renderTimer();
  });
});

document.getElementById('startTimer').addEventListener('click', () => {
  if (timerId || remainingSeconds === 0) return;
  message.textContent = 'Build sprint in progress.';
  timerId = setInterval(() => {
    remainingSeconds -= 1;
    renderTimer();
    if (remainingSeconds <= 0) stopTimer();
  }, 1000);
});

document.getElementById('pauseTimer').addEventListener('click', () => {
  stopTimer();
  message.textContent = 'Timer paused.';
});

document.getElementById('resetTimer').addEventListener('click', () => {
  stopTimer();
  remainingSeconds = selectedMinutes * 60;
  message.textContent = 'Ready when you are.';
  renderTimer();
});

renderTimer();

const projectGallery = document.getElementById('projectGallery');
const voteResults = document.getElementById('voteResults');
const voteStatus = document.getElementById('voteStatus');
const projectSourceStatus = document.getElementById('projectSourceStatus');
const challengeConfig = window.challengeConfig || {};

function normaliseUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed || trimmed === '#') return '';
  if (/^(https?:|data:|mailto:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normaliseResourceUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed || trimmed === '#') return '';
  if (/^(https?:|data:|mailto:)/i.test(trimmed)) return trimmed;
  if (/^(\.?\.?\/|\/)/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function googleDriveFileId(url) {
  try {
    const parsed = new URL(normaliseUrl(url));
    if (parsed.hostname !== 'drive.google.com') return '';

    const pathMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
    return pathMatch?.[1] || parsed.searchParams.get('id') || '';
  } catch {
    return '';
  }
}

function normaliseImageUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed || trimmed === '#') return '';

  const driveFileId = googleDriveFileId(trimmed);
  if (driveFileId) {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveFileId)}&sz=w1200`;
  }

  return normaliseUrl(trimmed);
}

function escapeSvg(text) {
  return String(text || '').replace(/[&<>]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  }[character]));
}

function placeholderImage(project) {
  const safeTeam = escapeSvg(project.team || 'NUS Computing');
  const safeTitle = escapeSvg(project.title || 'Project preview').slice(0, 34);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
      <rect width="960" height="600" fill="#eaf0f7"/>
      <rect x="54" y="54" width="852" height="492" rx="24" fill="#ffffff" stroke="#003d7c" stroke-opacity=".25"/>
      <rect x="86" y="82" width="178" height="42" rx="6" fill="#003d7c"/>
      <text x="108" y="111" fill="#ffffff" font-family="Arial, sans-serif" font-size="18" font-weight="700">NUS Computing</text>
      <text x="90" y="230" fill="#ef7c00" font-family="Arial, sans-serif" font-size="34" font-weight="700">${safeTeam}</text>
      <text x="90" y="310" fill="#003d7c" font-family="Arial, sans-serif" font-size="56" font-weight="700">${safeTitle}</text>
      <text x="90" y="382" fill="#52677d" font-family="Arial, sans-serif" font-size="28">Dummy image</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normaliseKey(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function pick(row, keys) {
  const rowByKey = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normaliseKey(key), value])
  );
  const found = keys.map(normaliseKey).find(key => rowByKey[key]);
  return found ? String(rowByKey[found]).trim() : '';
}

const teamColumnKeys = ['Choose Your Team', 'Team name', 'Team Name', 'Team'];
const timestampColumnKeys = ['Timestamp', 'Time stamp', 'Time Stamp', 'Submitted At', 'Submission time'];

function submissionTimestampValue(value) {
  const text = String(value || '').trim();
  if (!text) return Number.NEGATIVE_INFINITY;

  const parsed = Date.parse(text);
  if (Number.isFinite(parsed)) return parsed;

  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?/i);
  if (!match) return Number.NEGATIVE_INFINITY;

  let first = Number(match[1]);
  let second = Number(match[2]);
  const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
  let hours = Number(match[4] || 0);
  const minutes = Number(match[5] || 0);
  const seconds = Number(match[6] || 0);
  const meridiem = String(match[7] || '').toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  if (first > 12 && second <= 12) {
    [first, second] = [second, first];
  }

  return new Date(year, first - 1, second, hours, minutes, seconds).getTime();
}

function dedupeProjectRows(rows) {
  const latestByTeam = new Map();

  rows.forEach((row, index) => {
    const teamKey = normaliseKey(pick(row, teamColumnKeys)) || `row-${index}`;
    const timestamp = submissionTimestampValue(pick(row, timestampColumnKeys));
    const current = latestByTeam.get(teamKey);

    if (!current || timestamp > current.timestamp || (timestamp === current.timestamp && index > current.index)) {
      latestByTeam.set(teamKey, { row, index, timestamp });
    }
  });

  return Array.from(latestByTeam.values())
    .sort((a, b) => a.index - b.index)
    .map(entry => entry.row);
}

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const nextCharacter = csv[index + 1];

    if (quoted) {
      if (character === '"' && nextCharacter === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(value);
      value = '';
    } else if (character === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else if (character !== '\r') {
      value += character;
    }
  }

  row.push(value);
  rows.push(row);

  return rows.filter(items => items.some(item => String(item).trim()));
}

function csvToObjects(csv) {
  const rows = parseCsv(csv);
  const headers = rows.shift() || [];

  return rows.map(row => Object.fromEntries(
    headers.map((header, index) => [String(header).trim(), String(row[index] || '').trim()])
  ));
}

async function fetchCsvRows(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Could not load CSV: ${response.status}`);
  }

  return csvToObjects(await response.text());
}

function googleSheetInfo(url) {
  try {
    const parsed = new URL(url, window.location.href);
    const match = parsed.hostname === 'docs.google.com'
      ? parsed.pathname.match(/\/spreadsheets\/d\/([^/]+)/)
      : null;

    if (!match) return null;

    return {
      id: match[1],
      gid: parsed.searchParams.get('gid') || '0'
    };
  } catch {
    return null;
  }
}

function googleSheetJsonpUrl(url, callbackName) {
  const sheet = googleSheetInfo(url);
  if (!sheet) return '';

  const endpoint = new URL(`https://docs.google.com/spreadsheets/d/${sheet.id}/gviz/tq`);
  endpoint.searchParams.set('tqx', `responseHandler:${callbackName}`);
  endpoint.searchParams.set('gid', sheet.gid);
  endpoint.searchParams.set('headers', '1');
  endpoint.searchParams.set('tq', 'select *');
  endpoint.searchParams.set('_', String(Date.now()));
  return endpoint.toString();
}

function sheetCellValue(cell) {
  if (!cell) return '';
  if (cell.f !== undefined && cell.f !== null) return String(cell.f).trim();
  if (cell.v !== undefined && cell.v !== null) return String(cell.v).trim();
  return '';
}

function googleSheetResponseToObjects(response) {
  if (!response || response.status !== 'ok' || !response.table) {
    throw new Error('Google Sheet response was not usable.');
  }

  const headers = (response.table.cols || []).map((column, index) =>
    String(column.label || `Column ${index + 1}`).trim()
  );

  return (response.table.rows || []).map(row => Object.fromEntries(
    headers.map((header, index) => [header, sheetCellValue(row.c?.[index])])
  )).filter(row => Object.values(row).some(value => String(value).trim()));
}

function fetchGoogleSheetRows(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `googleSheetCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Google Sheet request timed out.'));
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
    }

    window[callbackName] = response => {
      try {
        const rows = googleSheetResponseToObjects(response);
        cleanup();
        resolve(rows);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Could not load Google Sheet script.'));
    };

    script.src = googleSheetJsonpUrl(url, callbackName);
    document.head.appendChild(script);
  });
}

function projectDataSources() {
  const configuredSources = challengeConfig.projectDataSources || [
    challengeConfig.projectDataUrl,
    challengeConfig.projectDataCsvUrl,
    challengeConfig.projectSheetCsvUrl
  ];

  return configuredSources.filter(Boolean);
}

function sourceLabel(url) {
  return googleSheetInfo(url) ? 'Google Sheet' : 'CSV data source';
}

async function fetchProjectRows(url) {
  const sourceUrl = normaliseResourceUrl(url);
  if (googleSheetInfo(sourceUrl)) {
    return fetchGoogleSheetRows(sourceUrl);
  }

  return fetchCsvRows(sourceUrl);
}

function mapProject(project, index) {
  const row = project || {};
  const team = pick(row, teamColumnKeys) || row.team || `Team ${String(index + 1).padStart(2, '0')}`;
  const title = pick(row, ['Project Title', 'Title', 'Project']) || row.title || `${team} prototype`;
  const url = pick(row, ['Project URL', 'Prototype URL', 'URL', 'Link']) || row.url || '';
  const image = pick(row, ['Image URL', 'Project Image', 'Screenshot URL', 'Image', 'Screenshot']) || row.image || challengeConfig.defaultProjectImage || '';
  const pitch = pick(row, ['Description', 'One line project description', 'One-line Description', 'Pitch', 'One-sentence Pitch', 'Summary']) || row.pitch || 'This is a place holder one sentence project description.';
  const id = slugify(`${team}-${title}`) || `project-${index + 1}`;

  return {
    id,
    team,
    title,
    url: normaliseUrl(url),
    image: normaliseImageUrl(image),
    pitch
  };
}

function fallbackProjects() {
  const configuredProjects = challengeConfig.fallbackProjects || [];
  if (configuredProjects.length) {
    return configuredProjects.map(mapProject);
  }

  return Array.from({ length: 17 }, (_, index) => mapProject({}, index));
}

function projectVoteLabel(project) {
  return `${project.team} - ${project.title}`;
}

function buildVoteUrl(project) {
  const formUrl = normaliseUrl(challengeConfig.votingFormUrl);
  if (!formUrl) return '';

  try {
    const url = new URL(formUrl);
    if (challengeConfig.votingFormProjectField) {
      url.searchParams.set(challengeConfig.votingFormProjectField, projectVoteLabel(project));
    }
    return url.toString();
  } catch {
    return formUrl;
  }
}

function simpleText(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function teamNumber(text) {
  const match = String(text || '').match(/\d+/);
  return match ? String(Number(match[0])) : '';
}

function findProjectForVote(choice, projects) {
  const simpleChoice = simpleText(choice);
  const choiceTeamNumber = teamNumber(choice);
  if (!simpleChoice) return null;

  return projects.find(project => {
    const label = simpleText(projectVoteLabel(project));
    const title = simpleText(project.title);
    const team = simpleText(project.team);
    const projectTeamNumber = teamNumber(project.team);

    return simpleChoice === label ||
      simpleChoice === title ||
      simpleChoice === team ||
      simpleChoice.includes(label) ||
      (title && simpleChoice.includes(title)) ||
      (team && simpleChoice.includes(team)) ||
      (choiceTeamNumber && choiceTeamNumber === projectTeamNumber);
  }) || null;
}

function renderVoteResults(projects, voteCounts, resultsConfigured) {
  if (!voteResults) return;
  voteResults.innerHTML = '';

  if (!resultsConfigured) {
    const empty = document.createElement('p');
    empty.textContent = 'Vote totals placeholder: publish the Google Form response Sheet as CSV to show live counts here.';
    voteResults.appendChild(empty);
    return;
  }

  const maxVotes = Math.max(...projects.map(project => voteCounts.get(project.id) || 0), 1);
  projects
    .map(project => ({ project, votes: voteCounts.get(project.id) || 0 }))
    .sort((a, b) => b.votes - a.votes || a.project.team.localeCompare(b.project.team))
    .forEach(({ project, votes }) => {
      const result = document.createElement('div');
      result.className = 'vote-result';

      const top = document.createElement('div');
      top.className = 'vote-result-top';

      const title = document.createElement('span');
      title.textContent = project.team;

      const count = document.createElement('span');
      count.textContent = `${votes} vote${votes === 1 ? '' : 's'}`;

      const bar = document.createElement('div');
      bar.className = 'vote-bar';

      const fill = document.createElement('span');
      fill.style.width = `${votes ? Math.max(6, (votes / maxVotes) * 100) : 0}%`;

      top.append(title, count);
      bar.appendChild(fill);
      result.append(top, bar);
      voteResults.appendChild(result);
    });
}

function renderProjects(projects, voteCounts = new Map(), resultsConfigured = false) {
  if (!projectGallery) return;

  projectGallery.innerHTML = '';

  projects.forEach(project => {
    const card = document.createElement('article');
    card.className = 'project-card';

    const imageBox = project.url ? document.createElement('a') : document.createElement('div');
    imageBox.className = 'project-image-link';
    if (project.url) {
      imageBox.href = project.url;
      imageBox.target = '_blank';
      imageBox.rel = 'noopener noreferrer';
      imageBox.title = `Open ${project.title}`;
    }

    const image = document.createElement('img');
    image.src = project.image || placeholderImage(project);
    image.alt = `${project.title} image`;
    image.loading = 'lazy';
    image.addEventListener('error', () => {
      if (image.dataset.fallbackApplied) return;
      image.dataset.fallbackApplied = 'true';
      image.src = placeholderImage(project);
    });
    imageBox.appendChild(image);

    const body = document.createElement('div');
    body.className = 'project-card-body';

    const meta = document.createElement('span');
    meta.className = 'project-meta';
    meta.textContent = project.team;

    const title = document.createElement('h3');
    title.textContent = project.title;

    const pitch = document.createElement('p');
    pitch.textContent = project.pitch;

    const actions = document.createElement('div');
    actions.className = 'project-card-actions';

    if (project.url) {
      const openLink = document.createElement('a');
      openLink.className = 'button button-secondary project-action-button';
      openLink.href = project.url;
      openLink.target = '_blank';
      openLink.rel = 'noopener noreferrer';
      openLink.textContent = 'Open prototype';
      actions.appendChild(openLink);
    }

    if (resultsConfigured) {
      const voteCount = document.createElement('span');
      voteCount.className = 'vote-count';
      const votes = voteCounts.get(project.id) || 0;
      voteCount.textContent = `${votes} vote${votes === 1 ? '' : 's'}`;
      actions.appendChild(voteCount);
    }

    const voteUrl = buildVoteUrl(project);
    if (voteUrl) {
      const voteLink = document.createElement('a');
      voteLink.className = 'button button-secondary project-action-button';
      voteLink.href = voteUrl;
      voteLink.target = '_blank';
      voteLink.rel = 'noopener noreferrer';
      voteLink.textContent = 'Vote';
      actions.appendChild(voteLink);
    }

    body.append(meta, title, pitch);
    if (actions.childElementCount) {
      body.appendChild(actions);
    }
    card.append(imageBox, body);
    projectGallery.appendChild(card);
  });
}

async function loadProjects() {
  const projects = fallbackProjects();
  const sources = projectDataSources();

  renderProjects(projects);

  if (!sources.length) {
    if (projectSourceStatus) {
      projectSourceStatus.textContent = 'Placeholder gallery: add an external CSV URL in event-config.js to load live submissions.';
    }
    return projects;
  }

  if (projectSourceStatus) {
    projectSourceStatus.textContent = `Loading project gallery from the ${sourceLabel(sources[0])}...`;
  }

  for (const source of sources) {
    try {
      const sourceRows = await fetchProjectRows(source);
      const projectRows = dedupeProjectRows(sourceRows);
      const duplicateCount = sourceRows.length - projectRows.length;
      const sheetProjects = projectRows.map(mapProject).filter(project => project.team || project.title);
      if (!sheetProjects.length) throw new Error('The data source did not contain project rows.');

      if (projectSourceStatus) {
        const duplicateNote = duplicateCount
          ? ` Removed ${duplicateCount} duplicate team submission${duplicateCount === 1 ? '' : 's'}.`
          : '';
        projectSourceStatus.textContent = `Loaded ${sheetProjects.length} project${sheetProjects.length === 1 ? '' : 's'} from the ${sourceLabel(source)}.${duplicateNote}`;
      }
      return sheetProjects;
    } catch {
      if (projectSourceStatus) {
        projectSourceStatus.textContent = `Could not load the ${sourceLabel(source)}. Trying the next project data source...`;
      }
    }
  }

  if (projectSourceStatus) {
    projectSourceStatus.textContent = 'Could not load any project data source. Showing the 17-team placeholder gallery until the data link is updated.';
  }
  return projects;
}

async function loadVoteCounts(projects) {
  const voteCounts = new Map(projects.map(project => [project.id, 0]));
  const resultsUrl = normaliseUrl(challengeConfig.voteResultsCsvUrl);

  if (!resultsUrl) {
    renderVoteResults(projects, voteCounts, false);
    return { voteCounts, resultsConfigured: false };
  }

  try {
    const rows = await fetchCsvRows(resultsUrl);
    rows.forEach(row => {
      const choice = pick(row, [
        challengeConfig.voteProjectColumn,
        'Project',
        'Project Vote',
        'Vote',
        'Favourite',
        'Favorite',
        'Choice'
      ]);
      const project = findProjectForVote(choice, projects);
      if (project) {
        voteCounts.set(project.id, (voteCounts.get(project.id) || 0) + 1);
      }
    });

    if (voteStatus) {
      voteStatus.textContent = 'Vote totals are loaded from the published response CSV.';
    }
    renderVoteResults(projects, voteCounts, true);
    return { voteCounts, resultsConfigured: true };
  } catch {
    if (voteStatus) {
      voteStatus.textContent = 'Could not load vote totals yet. Check that the response data source is published as CSV.';
    }
    renderVoteResults(projects, voteCounts, false);
    return { voteCounts, resultsConfigured: false };
  }
}

async function initialiseProjectGallery() {
  const projects = await loadProjects();
  const { voteCounts, resultsConfigured } = await loadVoteCounts(projects);
  renderProjects(projects, voteCounts, resultsConfigured);
}

initialiseProjectGallery();
