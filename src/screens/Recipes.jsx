import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db.js';
import { Sheet, useToast, Empty } from '../components/ui.jsx';
import { IconPlus, IconTrash, IconStar } from '../components/icons.jsx';

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const emptyRecipe = () => ({
  name: '',
  photo: null,
  tags: [],
  servings: 1,
  favorite: false,
  ingredients: [{ name: '', qty: '', unit: '' }],
  steps: [''],
  perServing: { calories: 0, protein: 0, carbs: 0, fat: 0 },
});

export default function Recipes() {
  const toast = useToast();
  const recipes = useLiveQuery(() => db.recipes.orderBy('createdAt').reverse().toArray(), []);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState(null);
  const [favOnly, setFavOnly] = useState(false);
  const [editing, setEditing] = useState(null); // recipe object or null

  const allTags = useMemo(() => {
    const set = new Set();
    (recipes || []).forEach((r) => (r.tags || []).forEach((t) => set.add(t)));
    return [...set].sort();
  }, [recipes]);

  const filtered = (recipes || []).filter((r) => {
    if (favOnly && !r.favorite) return false;
    if (tagFilter && !(r.tags || []).includes(tagFilter)) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Recipes</h1>
          <div className="sub">{(recipes || []).length} saved</div>
        </div>
        <button className="btn sm primary" onClick={() => setEditing(emptyRecipe())}>
          <IconPlus width={16} height={16} /> New
        </button>
      </div>

      <input
        className="input mb"
        placeholder="Search recipes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="chip-row mb">
        <button className={`chip ${favOnly ? 'active' : ''}`} onClick={() => setFavOnly((v) => !v)}>
          ★ Favorites
        </button>
        {allTags.map((t) => (
          <button
            key={t}
            className={`chip ${tagFilter === t ? 'active' : ''}`}
            onClick={() => setTagFilter((cur) => (cur === t ? null : t))}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty icon="🍳" title="No recipes found" hint="Tap New to create one." />
      ) : (
        filtered.map((r) => (
          <div key={r.id} className="card tight" onClick={() => setEditing(r)} style={{ cursor: 'pointer' }}>
            <div className="flex">
              {r.photo ? (
                <img src={r.photo} alt="" className="thumb-sm" />
              ) : (
                <div className="thumb-sm" style={{ background: 'var(--card-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  🍽️
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div className="between">
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      db.recipes.update(r.id, { favorite: !r.favorite });
                    }}
                    style={{ color: r.favorite ? 'var(--accent)' : 'var(--text-faint)' }}
                    aria-label="Favorite"
                  >
                    <IconStar filled={r.favorite} width={20} height={20} />
                  </button>
                </div>
                <div className="faint" style={{ fontSize: 13 }}>
                  {r.perServing.calories} kcal · {r.perServing.protein}g protein · {r.servings} servings
                </div>
                {(r.tags || []).length > 0 && (
                  <div className="chip-row" style={{ marginTop: 6 }}>
                    {r.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      <RecipeEditor recipe={editing} onClose={() => setEditing(null)} toast={toast} />
    </div>
  );
}

function RecipeEditor({ recipe, onClose, toast }) {
  const [draft, setDraft] = useState(null);
  const loadedId = draft?._key;
  const key = recipe ? (recipe.id ?? 'new') : null;

  if (recipe && loadedId !== key) {
    setDraft({
      _key: key,
      ...recipe,
      tags: [...(recipe.tags || [])],
      ingredients: recipe.ingredients?.length ? recipe.ingredients.map((i) => ({ ...i })) : [{ name: '', qty: '', unit: '' }],
      steps: recipe.steps?.length ? [...recipe.steps] : [''],
      perServing: { ...recipe.perServing },
    });
  }
  if (!recipe || !draft) return null;

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const setMacro = (k, v) => setDraft((d) => ({ ...d, perServing: { ...d.perServing, [k]: Number(v) || 0 } }));

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    set({ photo: dataUrl });
  }

  async function save() {
    if (!draft.name.trim()) return toast('Name required');
    const record = {
      name: draft.name.trim(),
      photo: draft.photo || null,
      tags: draft.tags,
      servings: Number(draft.servings) || 1,
      favorite: !!draft.favorite,
      ingredients: draft.ingredients.filter((i) => i.name.trim()).map((i) => ({
        name: i.name.trim(),
        qty: Number(i.qty) || 0,
        unit: i.unit.trim(),
      })),
      steps: draft.steps.filter((s) => s.trim()),
      perServing: draft.perServing,
    };
    if (draft.id) {
      await db.recipes.update(draft.id, record);
    } else {
      await db.recipes.add({ ...record, createdAt: Date.now() });
    }
    toast('Recipe saved');
    onClose();
    setDraft(null);
  }

  async function remove() {
    if (draft.id) await db.recipes.delete(draft.id);
    toast('Recipe deleted');
    onClose();
    setDraft(null);
  }

  const tagsStr = draft.tags.join(', ');

  return (
    <Sheet open={!!recipe} onClose={() => { onClose(); setDraft(null); }} title={draft.id ? 'Edit recipe' : 'New recipe'}>
      <div className="field">
        <label>Name</label>
        <input className="input" value={draft.name} onChange={(e) => set({ name: e.target.value })} />
      </div>

      <div className="field">
        <label>Photo</label>
        {draft.photo && <img src={draft.photo} alt="" className="thumb mb" />}
        <div className="btn-row">
          <label className="btn full" style={{ cursor: 'pointer' }}>
            {draft.photo ? 'Change photo' : 'Add photo'}
            <input type="file" accept="image/*" onChange={onPhoto} style={{ display: 'none' }} />
          </label>
          {draft.photo && (
            <button className="btn danger" onClick={() => set({ photo: null })}>
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="row-2">
        <div className="field">
          <label>Servings</label>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            value={draft.servings}
            onChange={(e) => set({ servings: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Favorite</label>
          <button
            className={`btn full ${draft.favorite ? 'primary' : ''}`}
            onClick={() => set({ favorite: !draft.favorite })}
          >
            {draft.favorite ? '★ Favorited' : '☆ Favorite'}
          </button>
        </div>
      </div>

      <div className="field">
        <label>Tags (comma separated)</label>
        <input
          className="input"
          value={tagsStr}
          onChange={(e) => set({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
          placeholder="high-protein, quick"
        />
      </div>

      <div className="card-title">Per serving</div>
      <div className="row-2">
        <div className="field">
          <label>Calories</label>
          <input className="input" type="number" inputMode="numeric" value={draft.perServing.calories} onChange={(e) => setMacro('calories', e.target.value)} />
        </div>
        <div className="field">
          <label>Protein (g)</label>
          <input className="input" type="number" inputMode="numeric" value={draft.perServing.protein} onChange={(e) => setMacro('protein', e.target.value)} />
        </div>
        <div className="field">
          <label>Carbs (g)</label>
          <input className="input" type="number" inputMode="numeric" value={draft.perServing.carbs} onChange={(e) => setMacro('carbs', e.target.value)} />
        </div>
        <div className="field">
          <label>Fat (g)</label>
          <input className="input" type="number" inputMode="numeric" value={draft.perServing.fat} onChange={(e) => setMacro('fat', e.target.value)} />
        </div>
      </div>

      <div className="card-title">Ingredients</div>
      {draft.ingredients.map((ing, i) => (
        <div key={i} className="flex" style={{ marginBottom: 8 }}>
          <input
            className="input"
            style={{ width: 64 }}
            type="number"
            inputMode="decimal"
            placeholder="Qty"
            value={ing.qty}
            onChange={(e) =>
              set({ ingredients: draft.ingredients.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)) })
            }
          />
          <input
            className="input"
            style={{ width: 70 }}
            placeholder="unit"
            value={ing.unit}
            onChange={(e) =>
              set({ ingredients: draft.ingredients.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)) })
            }
          />
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Ingredient"
            value={ing.name}
            onChange={(e) =>
              set({ ingredients: draft.ingredients.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })
            }
          />
          <button
            className="btn sm danger"
            onClick={() => set({ ingredients: draft.ingredients.filter((_, j) => j !== i) })}
            aria-label="Remove ingredient"
          >
            <IconTrash width={15} height={15} />
          </button>
        </div>
      ))}
      <button
        className="btn full mb"
        onClick={() => set({ ingredients: [...draft.ingredients, { name: '', qty: '', unit: '' }] })}
      >
        <IconPlus width={16} height={16} /> Add ingredient
      </button>

      <div className="card-title">Steps</div>
      {draft.steps.map((step, i) => (
        <div key={i} className="flex" style={{ marginBottom: 8, alignItems: 'flex-start' }}>
          <span className="faint" style={{ marginTop: 12, width: 16 }}>
            {i + 1}
          </span>
          <textarea
            className="textarea"
            style={{ minHeight: 56, flex: 1 }}
            value={step}
            onChange={(e) => set({ steps: draft.steps.map((s, j) => (j === i ? e.target.value : s)) })}
          />
          <button
            className="btn sm danger"
            onClick={() => set({ steps: draft.steps.filter((_, j) => j !== i) })}
            aria-label="Remove step"
          >
            <IconTrash width={15} height={15} />
          </button>
        </div>
      ))}
      <button className="btn full mb" onClick={() => set({ steps: [...draft.steps, ''] })}>
        <IconPlus width={16} height={16} /> Add step
      </button>

      <button className="btn primary full mb" onClick={save}>
        Save recipe
      </button>
      {draft.id && (
        <button className="btn danger full" onClick={remove}>
          Delete recipe
        </button>
      )}
    </Sheet>
  );
}
