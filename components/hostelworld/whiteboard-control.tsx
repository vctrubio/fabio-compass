"use client";

interface WhiteboardControlProps {
}

export function WhiteboardControl({  }: WhiteboardControlProps) {
    return (
        <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Control Panel</h3>
            <div className="space-y-2">
                <div className="flex gap-2">
         
                    <button className="px-3 py-1 text-xs border rounded-md hover:bg-muted transition-colors">
                        Submit Time:
                        ▲
                        ▼
                        09:00
                        ▲
                        ▼
                        11:00
                        13:00
                        16:00
                        Single:
                        1h
                        2h
                        3h
                        Group:
                        2h
                        3h
                        4h
                        Location:
                        Los Lances
                        Valdevaqueros
                    </button>
                </div>
            </div>
        </div>
    );
}
