/** Stepper degli <Schema>: senza JavaScript tutte le viste restano visibili una sotto l'altra. */

export function nextStep(current: number, delta: -1 | 1, total: number): number {
  return Math.min(total, Math.max(1, current + delta));
}

export function stepFromKey(key: string): -1 | 0 | 1 {
  if (key === 'ArrowRight') return 1;
  if (key === 'ArrowLeft') return -1;
  return 0;
}

export function initSchemas(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('.lz-schema').forEach((schema) => {
    if (schema.classList.contains('lz-js')) return;
    const viste = [...schema.querySelectorAll<HTMLElement>('.lz-vista')];
    const total = viste.length;
    if (total === 0) return;
    const cerchi = [...schema.querySelectorAll<HTMLButtonElement>('.lz-schema__cerchio')];
    const prec = schema.querySelector<HTMLButtonElement>('.lz-schema__prec');
    const succ = schema.querySelector<HTMLButtonElement>('.lz-schema__succ');
    const stato = schema.querySelector<HTMLElement>('.lz-schema__stato');
    let current = 1;

    const show = (step: number, annuncia: boolean) => {
      current = step;
      viste.forEach((vista, i) => vista.toggleAttribute('data-attiva', i === step - 1));
      cerchi.forEach((cerchio, i) => cerchio.setAttribute('aria-current', i === step - 1 ? 'step' : 'false'));
      if (prec) prec.disabled = step === 1;
      if (succ) succ.disabled = step === total;
      if (stato && annuncia) stato.textContent = viste[step - 1].querySelector('.lz-vista__riga')?.textContent ?? '';
    };

    schema.classList.add('lz-js');
    show(1, false);
    prec?.addEventListener('click', () => show(nextStep(current, -1, total), true));
    succ?.addEventListener('click', () => show(nextStep(current, 1, total), true));
    cerchi.forEach((cerchio, i) => cerchio.addEventListener('click', () => show(i + 1, true)));
    schema.addEventListener('keydown', (event) => {
      const delta = stepFromKey(event.key);
      if (delta === 0) return;
      event.preventDefault();
      show(nextStep(current, delta, total), true);
    });
  });
}
