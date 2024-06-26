import React from "react";
// import {Chess as ChessJs} from 'chess.js';
import {Chess, FEN} from "cm-chess";
import {Chessboard} from "react-chessboard";
import Collapsible from "./components/Collapsible";
import MoveHistoryPanel from "./components/MoveHistoryPanel";
import GameCard from "./components/GameCard";
import GameList from "./components/GameList";


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
    const [evalOn, setEvalOn] = React.useState(true);
    const [depth, setDepth] = React.useState(0);
    const [orientedWhite, setOrientedWhite] = React.useState(true);
    const [currTab, setCurrTab] = React.useState(0); // can be 0, 1, or 2
    const [currCollapsible, setCurrCollapsible] = React.useState(-1); // can be -1, 0, or 1
    const [chesscomUsername, setChesscomUsername] = React.useState('');
    const [lichessUsername, setLichessUsername] = React.useState('');
    const [pgn, setPgn] = React.useState('');
    const [libraryGames, setLibraryGames] = React.useState([
        {name: "Untitled game", date: "12/29/2022"},
        {name: "Positional London", date: "12/26/2022"},
        {name: "Final exam", date:"12/24/2022"},
        {name: "Untitled game", date: "12/29/2022"},
        {name: "Positional London", date: "12/26/2022"},
        {name: "Final exam", date:"12/24/2022"},
        {name: "Untitled game", date: "12/29/2022"},
        {name: "Positional London", date: "12/26/2022"},
        {name: "Final exam", date:"12/24/2022"},
        {name: "Untitled game", date: "12/29/2022"},
        {name: "Positional London", date: "12/26/2022"},
        {name: "Final exam", date:"12/24/2022"},
        {name: "Positional London", date: "12/26/2022"},
        {name: "Final exam", date:"12/24/2022"},
        {name: "Untitled game", date: "12/29/2022"},
        {name: "Positional London", date: "12/26/2022"},
        {name: "Final exam", date:"12/24/2022"},
        {name: "Untitled game", date: "12/29/2022"},
        {name: "Positional London", date: "12/26/2022"},
        {name: "Positional London", date: "12/26/2022"},
        {name: "Final exam", date:"12/24/2022"},
        {name: "Untitled game", date: "12/29/2022"},
        {name: "Positional London", date: "12/26/2022"},
        {name: "Final exam", date:"12/24/2022"},
        {name: "Untitled game", date: "12/29/2022"},
        {name: "Positional London", date: "12/26/2022"},
    ]);
    const [chesscomGames, setChesscomGames] = React.useState([
        {name: "Untitled game", date: "12/29/2022"},
        {name: "Positional London", date: "12/26/2022"},
        {name: "Final exam", date:"12/24/2022"}
    ]);
    const [lichessGames, setLichessGames] = React.useState([]);

    let promotionPiece = null

    function makeMove(move_) {
        console.log(move_)
        const result = game.move(move_, move);
        if (result !== null) {
            setMove(result);
            sendMessageToWorker('position fen ' + result.fen);
            sendMessageToWorker('go depth 25');
        }
        return result;
    }

    function onPromotionPieceSelect(piece, src, tgt) {
        promotionPiece = piece
        console.log(promotionPiece)
        console.log("peace: ", piece)
        return true
    }

    function onPieceDrop(src, tgt, piece) {
        // see if the move is legal
        console.log("onPieceDrop")
        const result = makeMove({
            from: src,
            to: tgt,
            piece: piece,
            promotion: promotionPiece === null ? null : promotionPiece.charAt(1).toLowerCase()
        });
        promotionPiece = null
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

    function toggleEval() {
        setEvalOn(!evalOn)
    }

    return (
        <div className="flex flex-col max-h-screen overflow-hidden">
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
            <div className="flex p-4 gap-4 flex-wrap justify-center">
                <div className="flex-1 flex-col text-slate-50">
                    <div className="flex w-full gap-1 mb-2 border-b border-slate-600">
                        <button onClick={() => setCurrTab(0)}
                                className={"flex-1 flex flex-nowrap items-center justify-center space-x-1 border-t border-x border-transparent hover:border-slate-600 rounded-t p-2 transition duration-100" + (currTab === 0 ? " bg-slate-600" : "")}>
                            <div className="flex items-center justify-center w-6 h-6 mr-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 -960 960 960">
                                    <path className="fill-slate-50"
                                          d="m498-412.62 212.15-212.15L668-668.15l-170 170-86-84.77-42.15 42.15L498-412.62ZM322.31-260Q292-260 271-281q-21-21-21-51.31v-455.38Q250-818 271-839q21-21 51.31-21h455.38Q808-860 829-839q21 21 21 51.31v455.38Q850-302 829-281q-21 21-51.31 21H322.31Zm0-60h455.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-455.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H322.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v455.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85Zm-140 200Q152-120 131-141q-21-21-21-51.31v-515.38h60v515.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h515.38v60H182.31ZM310-800v480-480Z"/>
                                </svg>
                            </div>
                            <span className="flex">Library</span>
                        </button>
                        <button onClick={() => setCurrTab(1)}
                                className={"flex-1 flex flex-nowrap items-center justify-center space-x-1 border-t border-x border-transparent hover:border-slate-600 rounded-t p-2 transition duration-100" + (currTab === 1 ? " bg-slate-600" : "")}>
                            <div className="flex items-center justify-center w-6 h-6">
                                {/*<img src="chesscom-pawn.png" alt="lichess.org"*/}
                                {/*     className="max-w-6 max-h-6"/>*/}
                                {/*<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 290 400" xmlSpace="preserve">*/}
                                {/*    <path className="fill-slate-50"*/}
                                {/*          d="M145 366c108.1 0 111-20.2 111-21.5 0-27.4-9.9-54.9-31-70.9-43.8-33.5-49.3-63.4-50.1-82.2 0-5 0-9.2-.1-12.5h34c4-7.4 6-14.2 6-22.7l-38.5-25.4c13.4-9.7 22.1-25.5 22.1-43.3 0-29.6-23.9-53.5-53.3-53.5S91.7 57.9 91.7 87.5c0 17.8 8.7 33.6 22.1 43.3l-38.5 25.4c0 8.5 2 15.3 6 22.7h34c-.1 3.3-.1 7.5-.1 12.5-.8 18.8-6.3 48.7-50.1 82.2-21 15.9-31 43.5-31 70.9C34 345.8 36.9 366 145 366z"/>*/}
                                {/*</svg>*/}
                                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 290 400"
                                     xmlSpace="preserve" className="mx-0.5 scale-75">
                                    <path className="fill-slate-50"
                                          d="M145 400c151.9 0 145-46.5 145-55.9 0-35.8-13.4-74.5-44.4-98.1-16.1-12.3-25.1-23-30.2-32.6 10.6 0 12.9-1.8 16.8-7.3 13.1-18.8 18.9-38.2 16-61.2-.8-6.2-3.6-10.1-8.7-13.4l-13.9-9.1c4.6-10.7 7.1-22.3 7.1-34.5C232.6 39.2 193.3 0 145 0S57.4 39.2 57.4 87.8c0 12.1 2.5 23.8 7.1 34.5l-13.9 9.1c-5.1 3.4-8 7.3-8.7 13.4-3 23 2.9 42.4 16 61.2 3.8 5.5 6.1 7.3 16.8 7.3-5.1 9.5-14 20.2-30.2 32.6C13.5 269.5 0 308.1 0 344c0 9.5-6.9 56 145 56z"/>
                                    <path className={currTab === 1 ? "fill-slate-600" : "fill-slate-700"}
                                          d="M145 366c108.1 0 111-20.2 111-21.5 0-27.4-9.9-54.9-31-70.9-43.8-33.5-49.3-63.4-50.1-82.2 0-5 0-9.2-.1-12.5h34c4-7.4 6-14.2 6-22.7l-38.5-25.4c13.4-9.7 22.1-25.5 22.1-43.3 0-29.6-23.9-53.5-53.3-53.5S91.7 57.9 91.7 87.5c0 17.8 8.7 33.6 22.1 43.3l-38.5 25.4c0 8.5 2 15.3 6 22.7h34c-.1 3.3-.1 7.5-.1 12.5-.8 18.8-6.3 48.7-50.1 82.2-21 15.9-31 43.5-31 70.9C34 345.8 36.9 366 145 366z"/>
                                </svg>
                            </div>
                            <span className="flex">Chess.com</span>
                        </button>
                        <button onClick={() => setCurrTab(2)}
                                className={"flex-1 flex flex-nowrap items-center justify-center space-x-1 border-t border-x border-transparent hover:border-slate-600 rounded-t p-2 transition duration-100" + (currTab === 2 ? " bg-slate-600" : "")}>
                            <div className="flex items-center justify-center w-6 h-6">
                                {/*<img src="lichess-horse.png" alt="lichess.org"*/}
                                {/*     className="max-w-6 max-h-6"/>*/}
                                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"
                                     xmlSpace="preserve">
                                    {/*<path d="m20 0c-11.08-2.5066e-15 -20 8.9198-20 20v40c-2.5066e-15 11.08 8.9198 20 20 20h40c11.08 0 20-8.9198 20-20v-40-20h-20-40z" className="fill-slate-500"/>*/}
                                    <path className="fill-slate-50"
                                          d="m37.656 74.009c-4.8354-0.36436-9.6886-1.699-13.955-3.8378-3.4383-1.7236-6.4517-3.92-9.0933-6.628-7.0896-7.2676-10.055-17.334-8.1548-27.684 1.5646-8.5227 6.1202-15.614 12.927-20.122 6.4164-4.2497 14.836-6.2637 24.632-5.8922l2.1764 0.082493 0.71448-0.46162c2.8371-1.8331 5.781-2.7675 10.74-3.409 1.3469-0.17424 1.5334-0.18309 1.7288-0.082031 0.24019 0.1242 0.31608 0.26074 0.31608 0.56864 0 0.11136-0.4595 2.1736-1.0211 4.5828-1.0078 4.3233-1.0194 4.3838-0.89332 4.6483 0.07031 0.14737 0.50749 0.95627 0.97159 1.7975 0.4641 0.84128 0.96793 1.7581 1.1196 2.0374 0.15171 0.2793 1.5664 2.8457 3.1439 5.7031 1.5774 2.8574 3.8363 6.9531 5.0198 9.1016 3.237 5.8763 4.9952 9.0631 5.4255 9.8339 0.50792 0.90969 0.63287 1.4871 0.62769 2.9005-0.0037 0.91614-0.03691 1.2203-0.20664 1.8732-0.86524 3.328-3.915 6.1562-8.8068 8.167-1.1079 0.45544-2.3332 0.85827-2.6106 0.85827-0.25397 0-0.38898-0.15415-1.129-1.2891-1.3352-2.0478-3.9112-4.9986-6.541-7.4929-1.5045-1.427-2.0154-1.8499-5.6466-4.6744-4.6142-3.5891-6.2759-5.0009-8.48-7.2045-3.9949-3.9941-5.887-7.2765-6.1716-10.706-0.08995-1.0838 0.18839-2.7981 0.50585-3.1155 0.41619-0.41619 1.1662-0.01476 1.064 0.56953-0.02694 0.15422-0.06902 0.65348-0.09347 1.1095-0.03663 0.68284-0.01606 0.94126 0.11629 1.4648 0.63768 2.5217 3.041 5.405 7.3949 8.8718 2.0126 1.6025 3.381 2.5855 7.6172 5.4717 5.194 3.5387 5.6984 3.9377 8.1641 6.4574 2.308 2.3586 3.494 3.8269 4.3474 5.3817 0.22404 0.4082 0.4147 0.75294 0.42366 0.7661 0.03949 0.05785 1.0174-0.24498 1.6091-0.49822 2.5156-1.0767 4.1441-3.2328 4.6375-6.1402l0.12817-0.75512-2.3219-3.8933c-1.2771-2.1413-2.9627-4.9656-3.7459-6.2761-2.1258-3.5573-10.258-17.183-10.81-18.114-0.26416-0.44496-0.4989-0.88442-0.52166-0.97656-0.0251-0.10167 0.35524-1.304 0.96742-3.0582 1.1589-3.3208 1.1586-3.0658 0.0028-2.7713-1.7885 0.45585-3.5267 1.2861-7.057 3.3706-0.71397 0.4216-1.2524 0.68973-1.385 0.68973-0.11934 0-0.6484-0.06957-1.1757-0.15451-2.4739-0.39872-5.0621-0.55615-7.5603-0.45987-5.5228 0.21286-10.604 1.8776-14.844 4.8634-4.762 3.3535-8.8329 8.8527-10.751 14.524-2.991 8.8413-0.68144 19.066 6.03 26.696 4.991 5.6739 11.828 9.2927 19.487 10.315 1.578 0.21053 4.5386 0.28823 6.1195 0.16059 7.0509-0.56924 13.253-3.3262 18.267-8.1207 0.79159-0.75686 0.94438-0.87009 1.174-0.87009 0.61003 0 0.83436 0.48111 0.49462 1.0608-0.76303 1.302-2.9045 3.6393-4.5382 4.9532-4.0237 3.236-9.0858 5.1841-14.924 5.7434-1.1092 0.10625-4.5728 0.1453-5.655 0.06376z"
                                          stroke-width=".92274"/>
                                </svg>
                            </div>
                            <span className="flex">Lichess</span>
                        </button>
                        <button onClick={() => setCurrTab(3)}
                                className={"flex-1 flex flex-nowrap items-center justify-center space-x-1 border-t border-x border-transparent hover:border-slate-600 rounded-t p-2 transition duration-100" + (currTab === 3 ? " bg-slate-600" : "")}>
                            <div className="flex items-center justify-center w-6 h-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 -960 960 960">
                                    <path className="fill-slate-50"
                                          d="M210-400q-12.75 0-21.37-8.63-8.63-8.63-8.63-21.38 0-12.76 8.63-21.37Q197.25-460 210-460h220q12.75 0 21.38 8.63 8.62 8.63 8.62 21.38 0 12.76-8.62 21.37Q442.75-400 430-400H210Zm0-160q-12.75 0-21.37-8.63-8.63-8.63-8.63-21.38 0-12.76 8.63-21.37Q197.25-620 210-620h380q12.75 0 21.38 8.63 8.62 8.63 8.62 21.38 0 12.76-8.62 21.37Q602.75-560 590-560H210Zm0-160q-12.75 0-21.37-8.63-8.63-8.63-8.63-21.38 0-12.76 8.63-21.37Q197.25-780 210-780h380q12.75 0 21.38 8.63 8.62 8.63 8.62 21.38 0 12.76-8.62 21.37Q602.75-720 590-720H210Zm314.62 503.84v-54.46q0-7.06 2.61-13.68 2.62-6.62 8.23-12.24l206.31-205.31q7.46-7.46 16.11-10.5 8.65-3.03 17.3-3.03 9.43 0 18.25 3.53 8.82 3.54 16.03 10.62l37 37.38q6.46 7.47 10 16.16Q860-439 860-430.31t-3.23 17.69q-3.23 9-10.31 16.46L641.15-190.85q-5.61 5.62-12.23 8.23-6.63 2.62-13.69 2.62h-54.46q-15.37 0-25.76-10.4-10.39-10.39-10.39-25.76Zm287.69-214.15-37-37.38 37 37.38Zm-240 202.62h38l129.84-130.47-18.38-19-18.62-18.76-130.84 130.23v38Zm149.46-149.47-18.62-18.76 37 37.76-18.38-19Z"/>
                                </svg>
                            </div>
                            <span className="flex">PGN</span>
                        </button>
                    </div>
                    <div className="flex flex-grow flex-col overflow-y-scroll">
                        <div className={"flex flex-1 gap-4" + (currTab === 0 ? " flex" : " hidden")}>
                            <GameList games={libraryGames}/>
                        </div>
                        <div className={"flex-col gap-4" + (currTab === 1 ? " flex" : " hidden")}>
                            <div className="flex flex-1 flex-col gap-2">
                                <label className="flex flex-col gap-2 text-slate-300 font-bold">
                                    Import games from Chess.com
                                    <input type="text" placeholder="Enter a chess.com username"
                                           className="p-1 bg-slate-500 rounded font-normal"/>
                                </label>
                                <div className="flex flex-col flex-1 gap-2">
                                    <button
                                        className="flex justify-center bg-green-600 text-slate-50 p-2 rounded hover:bg-green-700 transition duration-100 disabled:opacity-50 disabled:hover:bg-green-700">Fetch
                                        1 month of games
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <GameList games={chesscomGames}/>
                            </div>
                        </div>
                        <div
                            className={"flex-col gap-4 rounded overflow-hidden" + (currTab === 2 ? " flex" : " hidden")}>
                            <span className="flex justify-center">Coming soon!</span>

                        </div>
                        <div
                            className={"flex-col gap-4 rounded overflow-hidden" + (currTab === 3 ? " flex" : " hidden")}>
                            <label className="flex flex-col gap-2 text-slate-300 font-bold">
                                Import a game using PGN (Portable Game Notation)
                                <textarea placeholder="1.e4 e5 2.Nf3 Nf6..."
                                          className="p-1 bg-slate-500 rounded font-normal text-slate-50"/>
                            </label>
                            <button
                                className="flex flex-1 bg-green-600 text-slate-50 rounded p-2 justify-center hover:bg-green-700 transition duration-100 disabled:opacity-50 disabled:hover:bg-green-600"
                                type="submit">Import
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex border-slate-500 border rounded p-2 pt-0 flex-col gap-2 h-full">
                    <Chessboard boardWidth={500} customLightSquareStyle={{backgroundColor: "#cbd5e1"}}
                                customDarkSquareStyle={{backgroundColor: "#64748b"}}
                                boardOrientation={orientedWhite ? "white" : "black"}
                                position={move === null ? FEN.start : move.fen} onPieceDrop={onPieceDrop}
                                onPromotionPieceSelect={onPromotionPieceSelect}
                                />
                    <div className="flex flex-1 gap-2 p-2">
                        <div className="flex flex-1 justify-start">
                            <button
                                className="rounded-full fill-slate-400 hover:fill-slate-300 transition duration-100">
                                <svg className="" xmlns="http://www.w3.org/2000/svg" height="48" width="48">
                                    <path
                                        d="M8.35 40v-3h6.5l-.75-.6q-3.2-2.55-4.65-5.55-1.45-3-1.45-6.7 0-5.3 3.125-9.525Q14.25 10.4 19.35 8.8v3.1q-3.75 1.45-6.05 4.825T11 24.15q0 3.15 1.175 5.475 1.175 2.325 3.175 4.025l1.5 1.05v-6.2h3V40Zm20.35-.75V36.1q3.8-1.45 6.05-4.825T37 23.85q0-2.4-1.175-4.875T32.75 14.6l-1.45-1.3v6.2h-3V8h11.5v3h-6.55l.75.7q3 2.8 4.5 6t1.5 6.15q0 5.3-3.1 9.55-3.1 4.25-8.2 5.85Z"/>
                                </svg>
                            </button>
                        </div>
                        <button className="rotate-180 rounded-full hover:bg-slate-600 transition duration-100">
                            <svg className="fill-slate-50" xmlns="http://www.w3.org/2000/svg" height="48" width="48">
                                <path d="M34 36V12h3v24Zm-23 0V12l17.3 12Zm3-12Zm0 6.25L23.05 24 14 17.75Z"/>
                            </svg>
                        </button>
                        <button onClick={previousMove}
                                className="rotate-180 rounded-full hover:bg-slate-600 transition duration-100">
                            <svg className="fill-slate-50" xmlns="http://www.w3.org/2000/svg" height="48" width="48">
                                <path d="m18.75 36-2.15-2.15 9.9-9.9-9.9-9.9 2.15-2.15L30.8 23.95Z"/>
                            </svg>
                        </button>
                        <button onClick={nextMove} className="rounded-full hover:bg-slate-600 transition duration-100">
                            <svg className="fill-slate-50" xmlns="http://www.w3.org/2000/svg" height="48" width="48">
                                <path d="m18.75 36-2.15-2.15 9.9-9.9-9.9-9.9 2.15-2.15L30.8 23.95Z"/></svg>
                        </button>
                        <button className="rounded-full hover:bg-slate-600 transition duration-100">
                            <svg className="fill-slate-50" xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="M34 36V12h3v24Zm-23 0V12l17.3 12Zm3-12Zm0 6.25L23.05 24 14 17.75Z"/></svg>
                        </button>
                        <div className="flex flex-1 justify-end">
                            <button onClick={() => setOrientedWhite(!orientedWhite)} className="rounded-full fill-slate-400 hover:fill-slate-300 transition duration-100">
                                <svg className="" xmlns="http://www.w3.org/2000/svg" height="48" width="48">
                                    <path d="M8.35 40v-3h6.5l-.75-.6q-3.2-2.55-4.65-5.55-1.45-3-1.45-6.7 0-5.3 3.125-9.525Q14.25 10.4 19.35 8.8v3.1q-3.75 1.45-6.05 4.825T11 24.15q0 3.15 1.175 5.475 1.175 2.325 3.175 4.025l1.5 1.05v-6.2h3V40Zm20.35-.75V36.1q3.8-1.45 6.05-4.825T37 23.85q0-2.4-1.175-4.875T32.75 14.6l-1.45-1.3v6.2h-3V8h11.5v3h-6.55l.75.7q3 2.8 4.5 6t1.5 6.15q0 5.3-3.1 9.55-3.1 4.25-8.2 5.85Z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex-col gap-2">
                    <div className="flex flex-1 flex-col gap-2 text-slate-300">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 bg-slate-600 rounded">
                                <div className={"flex flex-nowrap justify-center rounded-l p-2 text-xl font-mono font-bold" + (eval_ >= 0 ? " bg-slate-50 text-slate-900" : " bg-slate-900 text-slate-50")}>
                                    {(eval_ > 0 ? "+" : "") + eval_.toFixed(2)}
                                </div>
                                <div className="flex flex-1 p-1">
                                    <div className="flex flex-1 flex-col justify-center">
                                        <span className="text-xs font-bold text-slate-400">Stockfish 15</span>
                                        <span className="text-sm text-slate-300">Depth {depth}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <button className="flex" onClick={toggleEval}>
                                            <div className="px-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" height="36" width="36">
                                                    <path
                                                        className={"fill-slate-300 transition duration-200" + (evalOn === true ? "" : " opacity-0")}
                                                        d="M280-260q-91.67 0-155.83-64.14Q60-388.28 60-479.91q0-91.63 64.17-155.86Q188.33-700 280-700h400q91.67 0 155.83 64.14Q900-571.72 900-480.09q0 91.63-64.17 155.86Q771.67-260 680-260H280Zm399.95-110q45.82 0 77.93-32.07Q790-434.14 790-479.95q0-45.82-32.07-77.93Q725.86-590 680.05-590q-45.82 0-77.93 32.07Q570-525.86 570-480.05q0 45.82 32.07 77.93Q634.14-370 679.95-370Z"/>
                                                    <path
                                                        className={"fill-slate-400 transition duration-200" + (evalOn === false ? "" : " opacity-0")}
                                                        d="M280-260q-91.67 0-155.83-64.14Q60-388.28 60-479.91q0-91.63 64.17-155.86Q188.33-700 280-700h400q91.67 0 155.83 64.14Q900-571.72 900-480.09q0 91.63-64.17 155.86Q771.67-260 680-260H280Zm0-60h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm-.05-50q45.82 0 77.93-32.07Q390-434.14 390-479.95q0-45.82-32.07-77.93Q325.86-590 280.05-590q-45.82 0-77.93 32.07Q170-525.86 170-480.05q0 45.82 32.07 77.93Q234.14-370 279.95-370ZM480-480Z"/>
                                                </svg>
                                                {/*<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"*/}
                                                {/*     height="36" width="36">*/}
                                                {/*    <path className={"fill-slate-300" + (evalOn === false ? "" : " invisible")}*/}
                                                {/*          d="M280-260q-91.67 0-155.83-64.14Q60-388.28 60-479.91q0-91.63 64.17-155.86Q188.33-700 280-700h400q91.67 0 155.83 64.14Q900-571.72 900-480.09q0 91.63-64.17 155.86Q771.67-260 680-260H280Zm0-60h400q66 0 113-47t47-113q0-66-47-113t-113-47H280q-66 0-113 47t-47 113q0 66 47 113t113 47Zm-.05-50q45.82 0 77.93-32.07Q390-434.14 390-479.95q0-45.82-32.07-77.93Q325.86-590 280.05-590q-45.82 0-77.93 32.07Q170-525.86 170-480.05q0 45.82 32.07 77.93Q234.14-370 279.95-370ZM480-480Z"/>*/}
                                                {/*</svg>*/}
                                            </div>

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
