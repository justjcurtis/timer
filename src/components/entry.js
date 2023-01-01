import { useEffect, useRef, useState } from "react"

const styles = {
    container: {
        marginTop: 10,
        width: '70%',
        marginLeft: '15%'
    },
    textbox: {
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: 'transparent',
        color: 'white',
        borderColor: 'transparent',
        boxShadow: 'none',
        borderBottom: '1px solid #666'
    },
    insertButton: {
        border: 'none',
        borderRadius: 5,
        backgroundColor: 'transparent',
        color: 'white',
        textAlign: 'center',
        alignContent: 'center'
    }
}

const VALID_CHARS = 'hms0123456789'
const Entry = ({ i, disabled, isSet, addTimer, editTimer, deleteTimer, insertTimer, str = null, focus = false }) => {
    const inputText = useRef(str)
    const [isValid, setIsValid] = useState(true)

    const getValFromS = (s, char) => {
        const arr = s.split(char)
        if (arr.length > 2) return null
        if (arr.length === 1) return { val: null, rest: s }
        const sVal = arr[0]
        const rest = arr[1]
        const val = parseInt(sVal)
        if (isNaN(val)) return null
        return { val, rest }
    }

    const getStr = () => {
        setIsValid(false)
        let t = 0
        let v = ''
        if (!inputText.current) return null
        const raw = inputText.current.value
        if (raw === undefined) return null
        let s = raw.trim().toLowerCase().split(' ').join('')
        if (s.length !== s.split('').filter(c => VALID_CHARS.includes(c)).length) return null
        for (const c of 'hms') {
            const next = getValFromS(s, c)
            if (next === null) return null
            const { val, rest } = next
            v += val == null ? '' : `${val}${c}`
            t += val == null ? 0 : val
            s = rest
        }
        if (t === 0) return null
        const result = s.length > 0 ? null : v
        if (result === null) return null
        setIsValid(true)
        return result

    }

    const handleKeyUp = ({ key }) => {
        if (key !== 'Enter') return
        const s = getStr()
        if (!s) return

        if (!isSet) addTimer(s)
        else editTimer(s, i)
    }

    const onBlur = () => {
        let s = inputText.current.value.trim().toLowerCase().split(' ').join('')
        if (focus) {
            if (s.length > 0) {
                s = getStr()
                if (s) addTimer(s)
            }
            return
        }
        if (s.length === 0) {
            deleteTimer(i)
            return
        }
        if (s !== str) {
            s = getStr()
            if (s) editTimer(s, i)
        }
    }

    useEffect(() => {
        inputText.current.value = str
        if (focus) {
            inputText.current.focus()
        }
        getStr()
    })

    return (
        <div style={styles.container}>
            {
                isSet ?
                    <><input ref={inputText} disabled={disabled} onBlur={onBlur} onKeyUp={handleKeyUp} style={styles.textbox} className={`placeholderWhite input ${isValid ? '' : 'is-danger'}`} type="text" defaultValue={str} />
                        <button style={styles.insertButton} disabled={disabled} onClick={() => insertTimer(i)}>+</button></> :
                    <input ref={inputText} disabled={disabled} onBlur={onBlur} onKeyUp={handleKeyUp} style={styles.textbox} className="placeholderWhite input" type="text" placeholder="enter time eg. 1m30s or 10s" />
            }
        </div>
    )
}

export { Entry }