import { useState } from 'react'
import { trpc } from '../utils/trpc'

export default function SettingsPage(): JSX.Element {
    const settingsQuery = trpc.getSettings.useQuery()
    const updateSettings = trpc.updateSettings.useMutation()
    const selectDirectory = trpc.selectDirectory.useMutation()

    const [zerokPath, setZerokPath] = useState('')
    const [barPath, setBarPath] = useState('')

    // Update local state when settings are loaded
    if (settingsQuery.isSuccess && zerokPath === '' && barPath === '') {
        setZerokPath(settingsQuery.data.zerokReplayPath)
        setBarPath(settingsQuery.data.barReplayPath)
    }

    const handleSelectZerokPath = (): void => {
        selectDirectory.mutate(undefined, {
            onSuccess: (result) => {
                if (!result.canceled && result.path) {
                    setZerokPath(result.path)
                }
            },
            onError: (error) => {
                console.error('Failed to open directory dialog:', error)
            }
        })
    }

    const handleSelectBarPath = (): void => {
        selectDirectory.mutate(undefined, {
            onSuccess: (result) => {
                if (!result.canceled && result.path) {
                    setBarPath(result.path)
                }
            },
            onError: (error) => {
                console.error('Failed to open directory dialog:', error)
            }
        })
    }

    const handleSave = (): void => {
        updateSettings.mutate(
            {
                zerokReplayPath: zerokPath,
                barReplayPath: barPath
            },
            {
                onSuccess: () => {
                    console.log('Settings saved successfully')
                    alert('Settings saved!')
                },
                onError: (error) => {
                    console.error('Failed to save settings:', error)
                    alert('Failed to save settings')
                }
            }
        )
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="space-y-6">
                {/* Zero-K Replay Path */}
                <div className="bg-neutral-800 p-6 rounded-lg">
                    <label className="block text-lg font-semibold mb-2">
                        Zero-K Replays Directory
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={zerokPath}
                            onChange={(e) => setZerokPath(e.target.value)}
                            className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-blue-500 focus:outline-none"
                            placeholder="C:/Program Files (x86)/Steam/steamapps/common/Zero-K/demos"
                        />
                        <button
                            onClick={handleSelectZerokPath}
                            disabled={selectDirectory.isPending}
                            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 text-white rounded border border-neutral-600 transition-colors"
                        >
                            Browse...
                        </button>
                    </div>
                    <p className="text-sm text-neutral-400 mt-2">
                        Path to your Zero-K replays folder
                    </p>
                </div>

                {/* BAR Replay Path */}
                <div className="bg-neutral-800 p-6 rounded-lg">
                    <label className="block text-lg font-semibold mb-2">
                        Beyond All Reason Replays Directory
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={barPath}
                            onChange={(e) => setBarPath(e.target.value)}
                            className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-blue-500 focus:outline-none"
                            placeholder="C:/Program Files (x86)/Steam/steamapps/common/Beyond All Reason/data/demos"
                        />
                        <button
                            onClick={handleSelectBarPath}
                            disabled={selectDirectory.isPending}
                            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 text-white rounded border border-neutral-600 transition-colors"
                        >
                            Browse...
                        </button>
                    </div>
                    <p className="text-sm text-neutral-400 mt-2">
                        Path to your Beyond All Reason replays folder
                    </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={updateSettings.isPending}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 text-white font-semibold rounded transition-colors"
                    >
                        {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>

                {/* Status Messages */}
                {settingsQuery.isLoading && (
                    <div className="text-neutral-400">Loading settings...</div>
                )}
                {settingsQuery.isError && (
                    <div className="text-red-500">Failed to load settings</div>
                )}
            </div>
        </div>
    )
}
