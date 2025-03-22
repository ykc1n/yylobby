export default function HomePage(): JSX.Element {
  return (
    <div>
      <div className="grid grid-cols-6 gap-4 text-neutral-200">
        <div className="mx-3 p-4 col-start-1 col-end-3 rounded bg-black/10">Welcome </div>

        <div className="col-start-3 col-end-5 rounded bg-black/10">
          <div className="flex justify-center">Welcome to ZK</div>
        </div>

        <div className="col-start-5 col-end-7 mx-3 rounded bg-black/10 flex justify-center">
          Your freinds
        </div>
      </div>
    </div>
  )
}
