import React from "react";
// import {Chess as ChessJs} from 'chess.js';
import {Chess, FEN} from "cm-chess";
import {Chessboard} from "react-chessboard";
import Collapsible from "./components/Collapsible";
import MoveHistoryPanel from "./components/MoveHistoryPanel";


export default function App() {

    const game = new Chess();

    // const [workerMessage, setWorkerMessage] = React.useState('');
    const stockfishWorkerRef = React.useRef();

    function sendMessageToWorker(message) {
        if (stockfishWorkerRef.current) {
            console.log("Message to Worker:", message);
            stockfishWorkerRef.current.postMessage(message);
        }
    }

    React.useEffect(() => {
        // Initialize the worker only if it hasn't been already
        if (!stockfishWorkerRef.current) {
            stockfishWorkerRef.current = new Worker('stockfishWorker.js');

            stockfishWorkerRef.current.addEventListener('message', (event) => {
                const message = event.data;
                console.log("Message from Worker:", message);
                // setWorkerMessage(message);

                const depthRegex = /info depth (\d+)/;
                const cpRegex = /score cp (-?\d+)/;

                const depthMatch = message.match(depthRegex);
                const cpMatch = message.match(cpRegex);

                if (depthMatch) {
                    const depth = parseInt(depthMatch[1], 10);
                    setDepth(depth); // Update the depth using setDepth

                    if (depth >= 5 && cpMatch) {
                        const cp = parseInt(cpMatch[1], 10);
                        const evaluation = cp / 100.;
                        setEval_(evaluation);
                    }
                }
            });

            sendMessageToWorker('uci');
            sendMessageToWorker('isready');
            sendMessageToWorker('ucinewgame');
            sendMessageToWorker('position fen ' + FEN.start);
            sendMessageToWorker('go depth 20');
        }

        // Clean up
        return () => {
            if (stockfishWorkerRef.current) {
                stockfishWorkerRef.current.terminate();
                stockfishWorkerRef.current = null;
            }
        };
    }, []);

    const [move, setMove] = React.useState(null);
    const [eval_, setEval_] = React.useState(0.0);
    const [depth, setDepth] = React.useState(0);
    const [orientedWhite, setOrientedWhite] = React.useState(true);
    const [currTab, setCurrTab] = React.useState(0); // can be 0, 1, or 2
    const importSourcesPretty = ["Chess.com", "Lichess.org", ""];
    const [currCollapsible, setCurrCollapsible] = React.useState(-1); // can be -1, 0, or 1
    const [importSource, setImportSource] = React.useState(-1); // can be -1, 0, or 1
    const [username, setUsername] = React.useState('');

    function makeMove(move_) {
        const result = game.move(move_, move);
        if (result !== null) {
            setMove(result);
            sendMessageToWorker('position fen ' + result.fen);
            sendMessageToWorker('go depth 25');
        }
        return result;
    }

    function onPieceDrop(src, tgt) {
        // see if the move is legal
        const result = makeMove({
            from: src,
            to: tgt,
            promotion: "q" // always promote to a queen for example simplicity
        });
        if (result !== null) {
            // stockfish.postMessage('position fen ' + result.fen);
            // stockfish.postMessage('go depth 20');
        }
        return result !== null;
    }

    function previousMove() {
        if (move !== null) {
            if (move.previous === undefined) {
                setMove(null);
            }
            else {
                setMove(move.previous);
            }
        }
    }

    function nextMove() {
        if (move === null) {
            setMove(game.history()[0]);
        }
        else if (move.next !== undefined) {
            setMove(move.next);
        }
    }

    return (
        <div className="flex flex-col">
            <nav className="flex p-2 text-sm text-slate-50">
                <span className="flex flex-1">eval.bar</span>
                <span className="flex flex-1"></span>
                <ul className="flex flex-1 justify-end gap-4">
                    <li>About</li>
                    <li>Support</li>
                </ul>
            </nav>
            <div className="flex bg-slate-900">
                <svg className="fill-slate-50" width={((eval_ * 10 + 100) / 2).toPrecision(2) + "%"} height={30}>
                    <rect className="w-full" height={30}/>
                </svg>
            </div>
            <div className="flex px-16 py-4 gap-8">
                <div className="flex flex-col gap-4 text-slate-50">
                    <div className="flex gap-1 border-b border-slate-600">
                        <button onClick={() => setCurrTab(0)} className={"border-t border-x border-transparent hover:border-slate-600 rounded-t p-2 transition duration-100" + (currTab === 0 ? " bg-slate-600" : "")}>
                            Library
                        </button>
                        <button onClick={() => setCurrTab(1)} className={"border-t border-x border-transparent hover:border-slate-600 rounded-t p-2 transition duration-100" + (currTab === 1 ? " bg-slate-600" : "")}>
                            Import by username
                        </button>
                        <button onClick={() => setCurrTab(2)} className={"border-t border-x border-transparent hover:border-slate-600 rounded-t p-2 transition duration-100" + (currTab === 2 ? " bg-slate-600" : "")}>
                            Magic import
                        </button>
                    </div>
                    <div className={"flex flex-1 gap-4" + (currTab === 0 ? " flex" : " hidden")}>
                        <div className="flex flex-1 flex-col gap-2 text-slate-50 overflow-y-scroll">
                            <button className="flex justify-between bg-slate-600 hover:bg-slate-500 p-2 rounded">
                                Untitled game
                                <span className="flex text-slate-400">
                                12/29/2022
                            </span>
                            </button>
                            <button className="flex justify-between bg-slate-600 hover:bg-slate-500 p-2 rounded">
                                Positional London
                                <span className="flex text-slate-400">
                                12/26/2022
                            </span>
                            </button>
                            <button className="flex justify-between bg-slate-600 hover:bg-slate-500 p-2 rounded">
                                Final exam
                                <span className="flex text-slate-400">
                                12/24/2022
                            </span>
                            </button>
                        </div>
                    </div>
                    <div className={"flex-col gap-4" + (currTab === 1 ? " flex" : " hidden")}>
                        <div className="flex flex-col bg-slate-600 rounded overflow-hidden">
                            <Collapsible label="Import from" currCollapsible={currCollapsible} setCurrCollapsible={setCurrCollapsible} selected={importSourcesPretty[importSource]} innerJSX={
                                <div className="flex flex-col text-slate-50 px-4">
                                    <label className="flex gap-2 items-center">
                                        <input type="radio" value="chess.com" name="importSource" onChange={(e) => setImportSource(e.target.value === "chess.com" ? 0 : -1)}/>
                                        Chess.com
                                    </label>
                                    <label className="flex gap-2 items-center">
                                        <input type="radio" value="lichess.org" name="importSource" onChange={(e) => setImportSource(e.target.value === "lichess.org" ? 1 : -1)}/>
                                        Lichess.org
                                    </label>
                                </div>
                            }/>
                            <Collapsible label="Played by" currCollapsible={currCollapsible} setCurrCollapsible={setCurrCollapsible} selected="Player 1" innerJSX={
                                <div className="flex flex-1 flex-col px-4 pb-4 gap-2">
                                    <input type="text" placeholder="Enter a chess.com username" className="p-1 bg-slate-500 rounded"/>
                                    <div className="flex flex-col flex-1 gap-2">
                                        <button className="flex justify-center bg-teal-600 text-slate-50 p-2 rounded hover:bg-teal-700 transition duration-100 disabled:opacity-50 disabled:hover:bg-teal-600">Fetch games</button>
                                        <button className="flex justify-center bg-green-600 text-slate-50 p-2 rounded hover:bg-green-700 transition duration-100 disabled:opacity-50 disabled:hover:bg-green-700">Most recent</button>
                                    </div>
                                </div>
                            }/>
                            <Collapsible label="In" currCollapsible={currCollapsible} setCurrCollapsible={setCurrCollapsible} selected="March 2020" innerJSX={
                                <div className="flex flex-col px-4 pb-4 gap-4">
                                    <input type="month" placeholder="MM-YYYY" className="p-1 bg-slate-500 rounded"/>
                                </div>
                            }/>
                        </div>
                        <div className="flex flex-col">
                            <select className="p-1 bg-slate-500 rounded">
                                <option>Game 1</option>
                                <option>Game 2</option>
                            </select>
                        </div>
                    </div>
                    <div className={"flex-col gap-4 rounded overflow-hidden" + (currTab === 2 ? " flex" : " hidden")}>
                        <label className="flex flex-col gap-2 text-slate-300 font-bold">
                            Paste game link or PGN
                            <textarea placeholder="1.e4 e5 2.Nf3 Nf6..." className="p-1 bg-slate-500 rounded font-normal text-slate-50"/>
                        </label>
                        <button className="flex flex-1 bg-green-600 text-slate-50 rounded p-2 justify-center hover:bg-green-700 transition duration-100 disabled:opacity-50 disabled:hover:bg-green-600" type="submit">Import</button>
                    </div>
                </div>
                <div className="flex border-slate-500 border rounded p-4 py-2 flex-1 flex-col gap-2">
                    <Chessboard boardWidth={500} customLightSquareStyle={{backgroundColor: "#cbd5e1"}} customDarkSquareStyle={{backgroundColor: "#64748b"}} boardOrientation={orientedWhite ? "white" : "black"} position={move === null ? FEN.start : move.fen} onPieceDrop={onPieceDrop}/>
                    <div className="flex flex-1 gap-2 p-2">
                        <div className="flex flex-1 justify-start">
                            <button className="rounded-full fill-slate-400 hover:fill-slate-300 transition duration-100">
                                <svg className="" xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="M8.35 40v-3h6.5l-.75-.6q-3.2-2.55-4.65-5.55-1.45-3-1.45-6.7 0-5.3 3.125-9.525Q14.25 10.4 19.35 8.8v3.1q-3.75 1.45-6.05 4.825T11 24.15q0 3.15 1.175 5.475 1.175 2.325 3.175 4.025l1.5 1.05v-6.2h3V40Zm20.35-.75V36.1q3.8-1.45 6.05-4.825T37 23.85q0-2.4-1.175-4.875T32.75 14.6l-1.45-1.3v6.2h-3V8h11.5v3h-6.55l.75.7q3 2.8 4.5 6t1.5 6.15q0 5.3-3.1 9.55-3.1 4.25-8.2 5.85Z"/></svg>
                            </button>
                        </div>
                        <button className="rotate-180 rounded-full hover:bg-slate-600 transition duration-100">
                            <svg className="fill-slate-50" xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="M34 36V12h3v24Zm-23 0V12l17.3 12Zm3-12Zm0 6.25L23.05 24 14 17.75Z"/></svg>
                        </button>
                        <button onClick={previousMove} className="rotate-180 rounded-full hover:bg-slate-600 transition duration-100">
                            <svg className="fill-slate-50" xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="m18.75 36-2.15-2.15 9.9-9.9-9.9-9.9 2.15-2.15L30.8 23.95Z"/></svg>
                        </button>
                        <button onClick={nextMove} className="rounded-full hover:bg-slate-600 transition duration-100">
                            <svg className="fill-slate-50" xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="m18.75 36-2.15-2.15 9.9-9.9-9.9-9.9 2.15-2.15L30.8 23.95Z"/></svg>
                        </button>
                        <button className="rounded-full hover:bg-slate-600 transition duration-100">
                            <svg className="fill-slate-50" xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="M34 36V12h3v24Zm-23 0V12l17.3 12Zm3-12Zm0 6.25L23.05 24 14 17.75Z"/></svg>
                        </button>
                        <div className="flex flex-1 justify-end">
                            <button onClick={() => setOrientedWhite(!orientedWhite)} className="rounded-full fill-slate-400 hover:fill-slate-300 transition duration-100">
                                <svg className="" xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="M8.35 40v-3h6.5l-.75-.6q-3.2-2.55-4.65-5.55-1.45-3-1.45-6.7 0-5.3 3.125-9.525Q14.25 10.4 19.35 8.8v3.1q-3.75 1.45-6.05 4.825T11 24.15q0 3.15 1.175 5.475 1.175 2.325 3.175 4.025l1.5 1.05v-6.2h3V40Zm20.35-.75V36.1q3.8-1.45 6.05-4.825T37 23.85q0-2.4-1.175-4.875T32.75 14.6l-1.45-1.3v6.2h-3V8h11.5v3h-6.55l.75.7q3 2.8 4.5 6t1.5 6.15q0 5.3-3.1 9.55-3.1 4.25-8.2 5.85Z"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col flex-1 gap-2">
                    <div className="flex flex-1 flex-col gap-2 text-slate-300">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 bg-slate-600 rounded">
                            <span className="flex bg-slate-900 text-slate-50 rounded-l p-2 text-xl font-bold">
                                {eval_.toPrecision(3)}
                            </span>
                                <div className="flex flex-1 p-1">
                                    <div className="flex flex-1 flex-col justify-center">
                                        <span className="text-xs font-bold text-slate-400">Stockfish 15</span>
                                        <span className="text-sm text-slate-300">Depth {depth}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <button className="flex">
                                            pause
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col text-sm bg-slate-600 rounded">
                                <div className="flex p-1 ">
                                    ... e4 e5
                                </div>
                                <div className="flex p-1 border-slate-500 border-y">
                                    ... e4 e5
                                </div>
                                <div className="flex p-1 ">
                                    ... e4 e5
                                </div>
                            </div>
                        </div>
                        <MoveHistoryPanel game={game}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
