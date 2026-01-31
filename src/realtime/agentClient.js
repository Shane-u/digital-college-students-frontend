import { executeAgentCommand } from './agentExecutor'

/**
 * WebRTC DataChannel client (browser)
 * - Signaling: WebSocket (`ws://localhost:3001/signal` by default)
 * - DataChannel label: "agent"
 */

const DEFAULT_SIGNAL_URL = 'ws://localhost:3001/signal'

export function initAgent(options = {}) {
  const signalUrl = options.signalUrl || DEFAULT_SIGNAL_URL
  const ws = new WebSocket(signalUrl)

  let pc
  let dc

  function sendSignal(msg) {
    ws.send(JSON.stringify(msg))
  }

  async function ensurePeer() {
    if (pc) return pc
    pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal({ type: 'ice', candidate: e.candidate.toJSON() })
    }

    pc.ondatachannel = (e) => {
      dc = e.channel
      wireDataChannel()
    }

    // 如果后端不主动创建 DataChannel，这里也创建一个（两者任一即可）
    dc = pc.createDataChannel('agent')
    wireDataChannel()

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    sendSignal({ type: 'offer', sdp: offer.sdp })
    return pc
  }

  function wireDataChannel() {
    if (!dc) return
    dc.onopen = () => console.log('[agent] datachannel open')
    dc.onclose = () => console.log('[agent] datachannel close')
    dc.onerror = (err) => console.warn('[agent] datachannel error', err)
    dc.onmessage = async (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        // 约定：{ id, cmd } 或直接 { type: ... }
        const cmd = msg.cmd || msg
        await executeAgentCommand(cmd)
        if (dc.readyState === 'open' && msg.id) {
          dc.send(JSON.stringify({ id: msg.id, ok: true }))
        }
      } catch (e) {
        console.error('[agent] execute failed', e)
        if (dc && dc.readyState === 'open') {
          dc.send(JSON.stringify({ ok: false, error: String(e?.message || e) }))
        }
      }
    }
  }

  ws.onopen = async () => {
    console.log('[agent] signaling ws open', signalUrl)
    await ensurePeer()
  }

  ws.onmessage = async (ev) => {
    const msg = JSON.parse(ev.data)
    await ensurePeer()
    if (msg.type === 'answer') {
      await pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp })
    } else if (msg.type === 'offer') {
      // 允许后端作为发起方
      await pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp })
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      sendSignal({ type: 'answer', sdp: answer.sdp })
    } else if (msg.type === 'ice') {
      try {
        await pc.addIceCandidate(msg.candidate)
      } catch (e) {
        console.warn('[agent] addIceCandidate failed', e)
      }
    }
  }

  ws.onclose = () => console.log('[agent] signaling ws closed')
  ws.onerror = (e) => console.warn('[agent] signaling ws error', e)

  // 暴露状态，便于调试
  window.DCSAgent = window.DCSAgent || {}
  window.DCSAgent._rtc = () => ({ pc, dc, ws })
}

