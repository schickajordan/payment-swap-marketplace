type GlobalCatalogSearchProps = {
  defaultQuery?: string;
};

/** Mobile + desktop omnibox — GET `/marketplace` like major retail catalog UX. */
export function GlobalCatalogSearch({ defaultQuery = "" }: GlobalCatalogSearchProps) {
  return (
    <form
      role="search"
      method="get"
      action="/marketplace"
      className="relative flex flex-1 items-stretch rounded-md md:max-w-2xl md:flex-1 lg:max-w-3xl"
    >
      <label htmlFor="catalog-search" className="sr-only">
        Search equipment
      </label>
      <input
        id="catalog-search"
        name="q"
        type="search"
        defaultValue={defaultQuery}
        placeholder="Try make, model, city, or category…"
        autoComplete="off"
        className="min-h-10 w-full min-w-0 rounded-l-md border border-r-0 border-slate-600 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />
      <button
        type="submit"
        className="shrink-0 rounded-r-md border border-gold bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d] focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-[#071733]"
      >
        Search
      </button>
    </form>
  );
}
