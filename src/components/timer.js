import { useRef, useState } from 'react'
import { Entry } from './entry'
const dingPath = require('../sounds/ding.m4a')

const styles = {
    container: {
        height: '100vh',
        color: 'white',
        overflow: 'hidden',
    },
    timerContainer: {
        height: '90vh',
        overflowY: 'scroll'
    },
    buttonContainer: {
        height: '10vh',
        textAlign: 'center'
    },
    bottomButton: {
        margin: 5
    },
    indicator: {
        position: 'absolute',
        width: '100%',
        height: 2,
        backgroundColor: '#602f33',
    },
    countdownText: {
        position: 'absolute',
        fontSize: 25,
        right: 25,
        bottom: 40
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
    const indicatorRightPos = useRef(0)

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
        let pos = 8 + (timerIndex.current * k) + ((currentMS.current / t) * k)
        const r = Math.round((t - currentMS.current) / 1000)
        indicatorValue.current = valToStr(r)
        indicatorRightPos.current = 25 + ((9 - indicatorValue.current.length) * 8)
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
        }, 300)
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
            <div style={styles.timerContainer}>
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
                }} className="button">❌</button>
                <button style={styles.bottomButton} disabled={timers.length < 1 && !isRunning} onClick={toggleRunning} className="button">{isRunning ? '⏸' : '▶️'}</button>
                <button style={styles.bottomButton} disabled={!isRunning} onClick={resetRun} className="button">⏹</button>
            </div >
            <div style={{ ...styles.countdownText, right: indicatorRightPos.current }}>{indicatorValue.current}</div>
        </div >
    )
}

export { Timer }