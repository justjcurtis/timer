import { useRef, useState } from 'react'
import { Entry } from './entry'
const dingPath = require('../sounds/ding.m4a')
const clearPath = require('../images/clear.png')
const pausePath = require('../images/pause.png')
const playPath = require('../images/play.png')
const stopPath = require('../images/stop.png')

const styles = {
    container: {
        height: '100vh',
        color: 'white',
        overflow: 'hidden',
    },
    timerContainer: {
        position: 'absolute',
        top: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        left: 0,
        right: 0,
        height: '66vh',
        overflowY: 'scroll'
    },
    buttonContainer: {
        bottom: '5vh',
        position: 'absolute',
        marginLeft: 'auto',
        marginRight: 'auto',
        left: 0,
        right: 0,
        height: '12vh',
        textAlign: 'center'
    },
    bottomButton: {
        margin: 5,
        backgroundColor: 'transparent',
        border: 'none'
    },
    buttomImage: {
        height: 40,
    },
    indicator: {
        position: 'absolute',
        width: '100%',
        height: 2,
        backgroundColor: '#602f33',
    },
    countdownText: {
        textAlign: 'center',
        position: 'absolute',
        fontSize: 30,
        marginLeft: 'auto',
        marginRight: 'auto',
        left: 0,
        right: 0,
        bottom: '4vh'
    }
}

const Timer = () => {
    const [timers, setTimers] = useState([])
    const [isRunning, setIsRunning] = useState(false)
    const currentMS = useRef(0)
    const timerIndex = useRef(0)
    const audio = new Audio(dingPath)
    const lastTime = useRef(Date.now())
    const intervalHandle = useRef(null)
    const [indicatorPosition, setIndicatorPosition] = useState(-2)
    const indicatorValue = useRef('')
    const timeDivRef = useRef(null)

    const valToStr = r => {
        let str = ''
        const h = Math.floor(r / 3600)
        if (h > 0) str += `${h}h`
        r -= h * 3600
        const m = Math.floor(r / 60)
        if (m > 0) str += `${m}m`
        r -= m * 60
        const s = Math.floor(r)
        if (s > 0) str += `${s}s`
        return str
    }

    const calculateIndicatorDetails = t => {
        const k = 84
        let pos = 8 + (timerIndex.current * k) + ((currentMS.current / t) * k) - timeDivRef.current.scrollTop
        if (pos > timeDivRef.current.clientHeight + 2) pos = -2
        const r = (Math.round((t - currentMS.current) / 1000))
        indicatorValue.current = valToStr(r)
        setIndicatorPosition(isNaN(pos) ? 0 : pos)
    }

    const play = () => {
        setIsRunning(true)
        lastTime.current = Date.now()
        intervalHandle.current = setInterval(() => {
            const t = getTime(timerIndex.current)
            calculateIndicatorDetails(t)
            const now = Date.now()
            currentMS.current += now - lastTime.current
            lastTime.current = now
            if (currentMS.current < t) return
            let newIndex = timerIndex.current + 1
            if (newIndex > timers.length) newIndex = 0
            currentMS.current = 0
            timerIndex.current = newIndex
            ding()
        }, 25)
    }

    const pause = () => {
        setIsRunning(false)
        clearInterval(intervalHandle.current)
    }

    const toggleRunning = () => {
        if (isRunning) {
            pause()
            return
        }
        play()
    }
    const resetRun = () => {
        pause()
        indicatorValue.current = ''
        setIndicatorPosition(-2)
        currentMS.current = 0
        timerIndex.current = 0
        lastTime.current = Date.now()
    }
    const addTimer = str => {
        setTimers([...timers, str])
        resetRun()
    }
    const insertTimer = i => {
        setTimers([...timers.slice(0, i + 1), '', ...timers.slice(i + 1)])
        resetRun()
    }
    const editTimer = (str, i) => {
        setTimers([...timers.slice(0, i), str, ...timers.slice(i + 1)])
        resetRun()
    }
    const deleteTimer = i => {
        timers.splice(i, 1)
        setTimers([...timers])
        resetRun()
    }
    const getTime = (i) => {
        let t = 0
        let s = timers[i] + ''
        for (const c of 'hms') {
            if (!s.includes(c)) continue
            const [str, rest] = s.split(c)
            const v = parseInt(str) * (c === 'h' ? 3600 : c === 'm' ? 60 : 1)
            t += v * 1000
            s = rest
        }
        return t
    }

    const ding = () => {
        if (timerIndex.current === 0) return
        audio.pause()
        audio.currentTime = 0
        audio.play()
    }

    return (
        <div style={styles.container}>
            <div style={{ ...styles.indicator, top: indicatorPosition }} />
            <div ref={timeDivRef} style={styles.timerContainer}>
                {timers.map((t, i) => {
                    return (
                        <div key={i}>
                            <Entry i={i} disabled={isRunning} isSet={true} addTimer={addTimer} editTimer={editTimer} deleteTimer={deleteTimer} insertTimer={insertTimer} str={t} />
                        </div>
                    )
                })}
                <Entry i={timers.length} disabled={isRunning} addTimer={addTimer} editTimer={editTimer} deleteTimer={deleteTimer} insertTimer={insertTimer} focus={true} />
            </div>
            <div style={styles.buttonContainer}>
                <button style={styles.bottomButton} disabled={timers.length < 1} onClick={() => {
                    resetRun()
                    setTimers([])
                }} className="button"><img style={styles.buttomImage} src={clearPath} alt="❌" /></button>
                <button style={styles.bottomButton} disabled={timers.length < 1 && !isRunning} onClick={toggleRunning} className="button"><img style={styles.buttomImage} src={isRunning ? pausePath : playPath} alt={isRunning ? '⏸' : '▶️'} /></button>
                <button style={styles.bottomButton} disabled={!isRunning && currentMS.current === 0 && timerIndex.current === 0} onClick={resetRun} className="button"><img style={styles.buttomImage} src={stopPath} alt="⏹" /></button>
            </div >
            <div style={styles.countdownText}>{indicatorValue.current}</div>
        </div >
    )
}

export { Timer }