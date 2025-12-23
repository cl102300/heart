import React, { useEffect, useRef, useState } from 'react';

// Configuration
const BASE_CANVAS_WIDTH = 640;
const BASE_CANVAS_HEIGHT = 480;
const CANVAS_CENTER_X = BASE_CANVAS_WIDTH / 2;
const CANVAS_CENTER_Y = BASE_CANVAS_HEIGHT / 2;
const IMAGE_ENLARGE_FACTOR = 11;
const HEART_COLOR = '#FF69B4';
const MUSIC_SOURCES = [
  { src: '/your-song.flac', type: 'audio/flac' },
  { src: '/your-song.mp3', type: 'audio/mpeg' },
  { src: '/your-song.ogg', type: 'audio/ogg' }
];
const START_LABEL_AFTER_MS =0;

// const tips = [
//     '好好学习哦，好好听课！','学习顺利', '白头偕老', '一起进步', '情深意浓', '相伴余生不负此生', '心神相通', '健康快乐', '幸福美满',
//   '多喝水哦~', '保持微笑呀', '每天都要元气满满', '记得吃早饭！', '记得吃水果', '保持好心情', '好好爱自己',
//   '我想你了', '祝你考试成功', '金榜提名', '顺顺利利', '早点休息', '原所有烦恼都消失', '别熬夜', '今天过的开心吗',
//   '天冷了多穿衣服。', '照顾好自己', '万事如意', '要天天开心吖', '压力大时深呼吸', '小进步也值得庆祝',
//   '天气好就多出去走走', '喜欢的事就去做，别在意别人的看法', '你就是你没人能代替', '始终坚信自己',
//   '人生就是用来潇洒的', '你值得所有美好', '不要给自己太大压力，你已经够好了', '路是自己走出来的'
// ];
const tips = [
  '考公顺利', '白头偕老', '一起进步', '情深意浓', '相伴余生不负此生', '心神相通', '健康快乐',
  '幸福美满','天冷了多穿衣服。', '照顾好自己', '万事如意', '要天天开心吖', '压力大时深呼吸', '小进步也值得庆祝',
  '天气好就多出去走走', '喜欢的事就去做，别在意别人的看法', '你就是你没人能代替', '始终坚信自己',
  '人生就是用来潇洒的', '你值得所有美好', '不要给自己太大压力，你已经够好了', '路是自己走出来的'
];

const bgColors = [
  { bg: '#FFB6C1', text: '#8B0000' }, // lightpink
  { bg: '#87CEEB', text: '#003366' }, // skyblue
  { bg: '#90EE90', text: '#006400' }, // lightgreen
  { bg: '#E6E6FA', text: '#4B0082' }, // lavender
  { bg: '#FFFFE0', text: '#8B6914' }, // lightyellow
  { bg: '#DDA0DD', text: '#4B0082' }, // plum
  { bg: '#FF7F50', text: '#8B0000' }, // coral
  { bg: '#FFE4C4', text: '#8B4513' }, // bisque
  { bg: '#7FFFD4', text: '#006400' }, // aquamarine
  { bg: '#FFE4E1', text: '#8B0000' }, // mistyrose
  { bg: '#F0FFF0', text: '#006400' }, // honeydew
  { bg: '#FFDAB9', text: '#8B4513' }, // peachpuff
  { bg: '#AFEEEE', text: '#008B8B' }, // paleturquoise
  { bg: '#FFF0F5', text: '#8B0000' }, // lavenderblush
  { bg: '#FDF5E6', text: '#8B6914' }, // oldlace
  { bg: '#FFFACD', text: '#8B6914' }, // lemonchiffon
  { bg: '#FFC0CB', text: '#8B0000' }, // pink
  { bg: '#B0E0E6', text: '#003366' }, // powderblue
  { bg: '#98FB98', text: '#006400' }, // palegreen
  { bg: '#F0E68C', text: '#8B6914' }, // khaki
  { bg: '#FFA07A', text: '#8B0000' }, // lightsalmon
  { bg: '#DDA0DD', text: '#4B0082' }, // plum
  { bg: '#F5DEB3', text: '#8B4513' }, // wheat
  { bg: '#E0FFFF', text: '#008B8B' }  // lightcyan
];

const isMobileDevice = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

// 将hex颜色转换为rgba格式
function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function generateHeartCoordinate(t, shrinkRatio = IMAGE_ENLARGE_FACTOR) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  const xx = x * shrinkRatio + CANVAS_CENTER_X;
  const yy = y * shrinkRatio + CANVAS_CENTER_Y;
  return [Math.round(xx), Math.round(yy)];
}

function rand() { return Math.random(); }

function scatterInside(x, y, beta = 0.15) {
  const ratioX = -beta * Math.log(rand());
  const ratioY = -beta * Math.log(rand());
  const dx = ratioX * (x - CANVAS_CENTER_X);
  const dy = ratioY * (y - CANVAS_CENTER_Y);
  return [x - dx, y - dy];
}

function shrinkCoordinate(x, y, ratio) {
  const denom = Math.pow(((x - CANVAS_CENTER_X) ** 2 + (y - CANVAS_CENTER_Y) ** 2), 0.6) || 1e-6;
  const force = -1 / denom;
  const dx = ratio * force * (x - CANVAS_CENTER_X);
  const dy = ratio * force * (y - CANVAS_CENTER_Y);
  return [x - dx, y - dy];
}

function customCurve(p) { return 2 * (2 * Math.sin(4 * p)) / (2 * Math.PI); }

class BeatingHeart {
  constructor({ generateFrame = 20, buildPoints = 1500 } = {}) {
    this._originalPoints = new Set();
    this._edgeDiffusionPoints = new Set();
    this._centerDiffusionPoints = new Set();
    this.allFramePoints = {};
    this.generateFrame = generateFrame;
    this.build(buildPoints);
    for (let frame = 0; frame < generateFrame; frame++) this.calculateFrame(frame);
  }
  build(numberOfPoints) {
    for (let i = 0; i < numberOfPoints; i++) {
      const t = Math.random() * 2 * Math.PI;
      const [x, y] = generateHeartCoordinate(t);
      this._originalPoints.add(`${x},${y}`);
    }
    const originals = Array.from(this._originalPoints).map(s => s.split(',').map(Number));
    for (const [x, y] of originals) {
      for (let i = 0; i < 2; i++) {
        const [nx, ny] = scatterInside(x, y, 0.06);
        this._edgeDiffusionPoints.add(`${Math.round(nx)},${Math.round(ny)}`);
      }
    }
    for (let i = 0; i < Math.min(2000, numberOfPoints * 2); i++) {
      const [x, y] = originals[Math.floor(Math.random() * originals.length)];
      const [nx, ny] = scatterInside(x, y, 0.17);
      this._centerDiffusionPoints.add(`${Math.round(nx)},${Math.round(ny)}`);
    }
  }
  static calculatePosition(x, y, ratio) {
    const denom = Math.pow(((x - CANVAS_CENTER_X) ** 2 + (y - CANVAS_CENTER_Y) ** 2), 0.520) || 1e-6;
    const force = 1 / denom;
    const dx = ratio * force * (x - CANVAS_CENTER_X) + (Math.floor(Math.random() * 3) - 1);
    const dy = ratio * force * (y - CANVAS_CENTER_Y) + (Math.floor(Math.random() * 3) - 1);
    return [x - dx, y - dy];
  }
  calculateFrame(frameNumber) {
    const ratio = 10 * customCurve(frameNumber / 10 * Math.PI);
    const haloRadius = Math.floor(4 + 6 * (1 + customCurve(frameNumber / 10 * Math.PI)));
    const haloNumber = Math.floor(700 + 1000 * Math.abs(Math.pow(customCurve(frameNumber / 10 * Math.PI), 2)));
    const allPoints = [];
    const heartHaloPoints = new Set();
    for (let i = 0; i < haloNumber; i++) {
      const t = Math.random() * 4 * Math.PI;
      let [x, y] = generateHeartCoordinate(t, 11.5);
      [x, y] = shrinkCoordinate(x, y, haloRadius);
      const key = `${x},${y}`;
      if (!heartHaloPoints.has(key)) {
        heartHaloPoints.add(key);
        x += Math.floor(Math.random() * 29) - 14;
        y += Math.floor(Math.random() * 29) - 14;
        const size = [1, 2, 2][Math.floor(Math.random() * 3)];
        allPoints.push([x, y, size]);
      }
    }
    for (const s of this._originalPoints) {
      const [x, y] = s.split(',').map(Number);
      const [nx, ny] = BeatingHeart.calculatePosition(x, y, ratio);
      const size = 1 + Math.floor(Math.random() * 3);
      allPoints.push([nx, ny, size]);
    }
    for (const s of this._edgeDiffusionPoints) {
      const [x, y] = s.split(',').map(Number);
      const [nx, ny] = BeatingHeart.calculatePosition(x, y, ratio);
      const size = 1 + Math.floor(Math.random() * 2);
      allPoints.push([nx, ny, size]);
    }
    for (const s of this._centerDiffusionPoints) {
      const [x, y] = s.split(',').map(Number);
      const [nx, ny] = BeatingHeart.calculatePosition(x, y, ratio);
      const size = 1 + Math.floor(Math.random() * 2);
      allPoints.push([nx, ny, size]);
    }
    this.allFramePoints[frameNumber] = allPoints;
  }
  render(ctx, renderFrame) {
    const points = this.allFramePoints[renderFrame % this.generateFrame] || [];
    for (const [x, y, size] of points) {
      ctx.fillRect(x, y, size, size);
    }
  }
}

export default function BeatingHeartPage() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [tipsList, setTipsList] = useState([]);
  const heartRef = useRef(null);
  const frameRef = useRef(0);
  const timeoutsRef = useRef([]);
  const scaleRef = useRef({ x: 1, y: 1, width: BASE_CANVAS_WIDTH, height: BASE_CANVAS_HEIGHT });
  const audioUnlockedRef = useRef(false);
  const tipIndexRef = useRef(0); // 用于循环显示所有tips
  const mobile = isMobileDevice();

  const WINDOW_COUNT = mobile ? tips.length * 2 : tips.length * 3;
  const LABEL_SPAWN_INTERVAL_MS = 400; // 每0.5秒出现一个标签
  const BUILD_POINTS = mobile ? 600 : 1500;
  // 移除最大可见标签数限制，让所有标签都保留在屏幕上

  useEffect(() => {
    heartRef.current = new BeatingHeart({ generateFrame: 20, buildPoints: BUILD_POINTS });
    
    function unlockAudioOnce(e) {
      if (!audioRef.current || audioUnlockedRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      const playPromise = audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioUnlockedRef.current = true;
      }).catch(err => {
        console.log('Audio unlock failed:', err);
      });
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
    
    // 使用被动监听器以提高移动端性能
    const options = { passive: false, once: true };
    window.addEventListener('touchstart', unlockAudioOnce, options);
    window.addEventListener('click', unlockAudioOnce, options);

    return () => {
      window.removeEventListener('touchstart', unlockAudioOnce);
      window.removeEventListener('click', unlockAudioOnce);
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 2 : 2);
      const padding = mobile ? 16 : 20;
      const maxWidth = Math.min(window.innerWidth - padding * 2, BASE_CANVAS_WIDTH);
      const width = Math.max(mobile ? 280 : 300, maxWidth);
      const height = Math.round((BASE_CANVAS_HEIGHT / BASE_CANVAS_WIDTH) * width);
      
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // 保存缩放比例
      scaleRef.current = {
        x: width / BASE_CANVAS_WIDTH,
        y: height / BASE_CANVAS_HEIGHT,
        width: width,
        height: height,
        dpr: dpr
      };
      
      // 如果heart已创建，需要重新创建以适应新尺寸
      if (heartRef.current) {
        heartRef.current = new BeatingHeart({ generateFrame: 20, buildPoints: BUILD_POINTS });
      }
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => {
      setTimeout(resizeCanvas, 100);
    });
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, [mobile, BUILD_POINTS]);

  useEffect(() => {
    if (!running || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    const scale = scaleRef.current;

    function draw() {
      // 使用实际的canvas尺寸（考虑DPI）
      const actualWidth = scale.width * scale.dpr;
      const actualHeight = scale.height * scale.dpr;
      
      // 临时重置transform以清除整个canvas
      const savedTransform = ctx.getTransform();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, actualWidth, actualHeight);
      ctx.setTransform(savedTransform);
      
      // 应用缩放
      ctx.save();
      ctx.scale(scale.x, scale.y);
      ctx.fillStyle = HEART_COLOR;
      heartRef.current.render(ctx, frameRef.current);
      ctx.restore();
      
      frameRef.current += 1;
      animationRef.current = requestAnimationFrame(draw);
    }

    animationRef.current = requestAnimationFrame(draw);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      spawnLabelWindows(WINDOW_COUNT, LABEL_SPAWN_INTERVAL_MS);
    }, START_LABEL_AFTER_MS);
    timeoutsRef.current.push(t);
    return () => clearTimeout(t);
  }, [running]);

  function spawnLabelWindows(count = WINDOW_COUNT, intervalMs = LABEL_SPAWN_INTERVAL_MS) {
    for (let i = 0; i < count; i++) {
      const to = setTimeout(() => {
        setTipsList(prev => {
          const tipWidth = mobile ? 160 : 240;
          const tipHeight = mobile ? 70 : 100;
          const padding = mobile ? 10 : 16;
          const safeAreaTop = mobile ? 60 : 80; // 顶部安全区域，避免与标题重叠
          const safeAreaBottom = mobile ? 100 : 120; // 底部安全区域
          
          // 计算可用区域
          const availableWidth = window.innerWidth - padding * 2;
          const availableHeight = window.innerHeight - safeAreaTop - safeAreaBottom;
          
          const x = Math.floor(Math.random() * Math.max(1, availableWidth - tipWidth)) + padding;
          const y = Math.floor(Math.random() * Math.max(1, availableHeight - tipHeight)) + safeAreaTop;
          
          // 循环使用所有tips，确保每个都能显示
          const tip = tips[tipIndexRef.current % tips.length];
          const colorScheme = bgColors[Math.floor(Math.random() * bgColors.length)];
          const id = `tip-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`;
          
          tipIndexRef.current++;
          // 不再限制数量，所有标签都保留
          return [...prev, { id, x, y, tip, bg: colorScheme.bg, textColor: colorScheme.text }];
        });
      }, i * intervalMs);
      timeoutsRef.current.push(to);
    }
  }

  function removeTip(id) { setTipsList(prev => prev.filter(t => t.id !== id)); }

  function stopAll() {
    setRunning(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setTipsList([]);
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
    tipIndexRef.current = 0; // 重置标签索引
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }

  async function handlePlay() {
    if (!audioRef.current) return;
    
    try {
      // 确保音频上下文已解锁
      if (!audioUnlockedRef.current) {
        try {
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioUnlockedRef.current = true;
        } catch (e) {
          console.log('音频解锁尝试:', e);
        }
      }
      
      // 播放音频
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
        setRunning(true);
      } else {
        setRunning(true);
      }
    } catch (error) {
      console.error('播放音频失败:', error);
      // 即使音频播放失败，也启动动画
      setRunning(true);
    }
  }

  function handleAudioEnded() { stopAll(); }

  const containerStyle = { 
    minHeight: mobile ? '-webkit-fill-available' : '100vh',
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    background: '#000', 
    color: '#fff', 
    padding: mobile ? '12px 8px' : 16,
    paddingBottom: mobile ? '80px' : 16,
    boxSizing: 'border-box',
    width: '100%',
    overflowX: 'hidden'
  };
  const headerStyle = { 
    width: '100%', 
    maxWidth: 1024, 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: mobile ? 'flex-start' : 'center',
    flexDirection: mobile ? 'column' : 'row',
    marginBottom: mobile ? 8 : 12,
    gap: mobile ? 8 : 0
  };
  const canvasWrap = { 
    position: 'relative', 
    width: '100%', 
    maxWidth: BASE_CANVAS_WIDTH, 
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)', 
    borderRadius: mobile ? 8 : 16, 
    overflow: 'hidden',
    margin: '0 auto'
  };
  const tipStyleBase = { 
    position: 'fixed', 
    zIndex: 60, 
    maxWidth: mobile ? 160 : 240, 
    padding: 0, 
    cursor: 'pointer',
    touchAction: 'none',
    WebkitTapHighlightColor: 'transparent',
    animation: 'fadeInScale 0.5s ease-out',
    willChange: 'transform, opacity'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ 
          color: '#ff73b4', 
          fontSize: mobile ? 18 : 20, 
          fontWeight: 700, 
          margin: 0,
          lineHeight: 1.2,
          fontFamily: 'inherit',
          textAlign: mobile ? 'center' : 'left',
          width: mobile ? '100%' : 'auto'
        }}>
          Beating Heart
        </h1>
        <div>
          {!running ? (
            <button 
              onClick={handlePlay} 
              onTouchEnd={(e) => {
                e.preventDefault();
                handlePlay();
              }}
              style={{ 
                padding: mobile ? '10px 16px' : '8px 12px', 
                background: '#ff5aa8', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 6,
                fontSize: mobile ? 16 : 14,
                fontWeight: 600,
                minWidth: mobile ? '100px' : 'auto',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              {mobile ? '播放' : '播放 / 启动'}
            </button>
          ) : (
            <button 
              onClick={stopAll}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopAll();
              }}
              style={{ 
                padding: mobile ? '10px 16px' : '8px 12px', 
                background: '#444', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 6,
                fontSize: mobile ? 16 : 14,
                fontWeight: 600,
                minWidth: mobile ? '100px' : 'auto',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            >
              停止
            </button>
          )}
        </div>
      </div>

      <div style={canvasWrap}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          pointerEvents: 'none' 
        }}>
          <div style={{ 
            color: '#ffb6d8', 
            fontFamily: 'inherit',
            fontSize: mobile ? 13 : 16,
            textAlign: 'center',
            padding: mobile ? '0 8px' : 0,
            lineHeight: 1.4
          }}>
            Ich will mit dir zusammen sein
          </div>
        </div>
      </div>

    
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded} 
        preload="metadata" 
        playsInline
        crossOrigin="anonymous"
        webkit-playsinline="true"
      >
        {MUSIC_SOURCES.map(s => (<source key={s.src} src={s.src} type={s.type} />))}
      </audio>

      {tipsList.map(t => (
        <div 
          key={t.id} 
          onClick={() => removeTip(t.id)} 
          onTouchEnd={(e) => {
            e.preventDefault();
            removeTip(t.id);
          }}
          style={{ ...tipStyleBase, left: t.x, top: t.y }}
        >
          <div style={{ 
            background: `linear-gradient(135deg, ${t.bg} 0%, ${hexToRgba(t.bg, 0.9)} 50%, ${t.bg} 100%)`,
            padding: mobile ? '10px 12px' : '12px 16px', 
            borderRadius: mobile ? 12 : 16, 
            color: t.textColor || '#333', 
            fontSize: mobile ? 14 : 15,
            lineHeight: 1.5,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
            fontFamily: 'inherit',
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            fontWeight: 600,
            border: '2px solid rgba(255,255,255,0.5)',
            transition: 'all 0.3s ease',
            animation: 'float 3s ease-in-out infinite',
            animationDelay: `${(tipsList.indexOf(t) % 10) * 0.1}s`,
            textShadow: '0 1px 3px rgba(255,255,255,0.8), 0 0 1px rgba(0,0,0,0.1)',
            WebkitTextStroke: '0.3px transparent'
          }}>
            {t.tip}
          </div>
        </div>
      ))}
    </div>
  );
}
