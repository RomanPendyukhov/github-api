const field = document.querySelector('.input__field');
const autocomplete = document.querySelector('.input__suggestions');
const results = document.querySelector('.results');
const url = 'https://api.github.com/search/repositories';

function debounce(fn, ms) {
  let inDebounce;

  return function (...args) {
    return new Promise(res => {
      clearTimeout(inDebounce);
      inDebounce = setTimeout(() => res(fn.apply(this, args)), ms);
    });
  };
}

function createAutoCompleteEl(data) {
  const li = document.createElement('li');
  li.textContent = data.name;
  li.dataset.id = data.id;
  li.dataset.owner = data.owner.login;
  li.dataset.stars = data.stargazers_count;

  autocomplete.append(li);
  autocomplete.addEventListener('click', addResults);
}

function fillAutoComplete(data) {
  autocomplete.innerHTML = ' ';

  if (data) {
    if (!data.total_count) autocomplete.textContent = 'nothing found';
    data.items.forEach(createAutoCompleteEl);
  }
}

function addResults(e) {
  e.target.remove();
  field.value = '';
  results.innerHTML += `<li class="results__item">
  <div class="results__block">
    <p class="results__name">Name: ${e.target.textContent}</p>
    <p class="results__owner">Owner: ${e.target.dataset.owner}</p>
    <p class="results__stars">Starts: ${e.target.dataset.stars}</p>
  </div>
  <div class="button">
    <span class="button__left"></span>
    <span class="button__right"></span>
  </div>
  </li>`;

  results.addEventListener('click', removeResult);

  if (!autocomplete.children.length) {
    autocomplete.removeEventListener('click', addResults);
  }
}

function removeResult(e) {
  if (e.target.classList.contains('button')) {
    e.target.parentElement.remove();
  }

  if (
    e.target.classList.contains('button__left') ||
    e.target.classList.contains('button__right')
  ) {
    e.target.parentElement.parentElement.remove();
  }

  if (!results.children.length)
    results.removeEventListener('click', removeResult);
}

async function getRepos(query) {
  if (!field.value || !query.trim()) {
    autocomplete.innerHTML = '';
    autocomplete.removeEventListener('click', addResults);
    return;
  }

  return await fetch(`${url}?q=${query}&per_page=5`)
    .then(res => (res.ok ? res.json() : Promise.reject(res)))
    .catch(e => console.log(e));
}

const debouncedGetRepos = debounce(getRepos, 500);

field.addEventListener('input', e =>
  debouncedGetRepos(e.target.value).then(fillAutoComplete)
);