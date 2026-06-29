'use client';

import React, { useRef, useEffect, useState } from 'react';

interface RippleImageProps {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
}

const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_uv;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    // Invert Y coordinate for WebGL texture mapping if necessary
    // But usually standard mapping is fine
    v_uv = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_image;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_hover;

  void main() {
    vec2 uv = v_uv;
    
    // Fix aspect ratio distortion by keeping calculations proportional
    // For simplicity, we assume square or near-square mapping for the distance
    
    float dist = distance(uv, u_mouse);
    
    // Smooth falloff around the mouse
    float radius = 0.4;
    float effect = smoothstep(radius, 0.0, dist);
    
    // Create organic water ripples
    float wave = sin(dist * 30.0 - u_time * 4.0) * effect;
    
    // Apply distortion
    // u_hover eases from 0 to 1 to fade the effect in/out
    float intensity = 0.03 * u_hover; 
    
    vec2 distortedUV = uv + (uv - u_mouse) * wave * intensity;
    
    gl_FragColor = texture2D(u_image, distortedUV);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function RippleImage({ src, alt, className }: RippleImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mouse tracking state
  const mouse = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const hoverState = useRef({ value: 0, target: 0 });
  
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const gl = canvas.getContext('webgl', { alpha: true });
    if (!gl) return;

    // Load image
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = src;
    
    let animationFrameId: number;

    image.onload = () => {
      setImageLoaded(true);

      // Set canvas resolution
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Shaders
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      if (!vertexShader || !fragmentShader) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
      }

      gl.useProgram(program);

      // Vertices (2 triangles forming a quad)
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1.0, -1.0,  0.0, 0.0,
           1.0, -1.0,  1.0, 0.0,
          -1.0,  1.0,  0.0, 1.0,
          -1.0,  1.0,  0.0, 1.0,
           1.0, -1.0,  1.0, 0.0,
           1.0,  1.0,  1.0, 1.0,
        ]),
        gl.STATIC_DRAW
      );

      const positionLocation = gl.getAttribLocation(program, 'a_position');
      const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

      // 4 bytes per float, 4 floats per vertex (x,y, u,v)
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);

      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

      // Texture
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      // Setup texture wrapping & filtering
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Upload image
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      // Uniforms
      const uMouseLoc = gl.getUniformLocation(program, 'u_mouse');
      const uTimeLoc  = gl.getUniformLocation(program, 'u_time');
      const uHoverLoc = gl.getUniformLocation(program, 'u_hover');

      let startTime = performance.now();

      // Render loop
      const render = (time: number) => {
        // Lerp mouse
        mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.1;
        mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.1;
        
        // Lerp hover intensity
        hoverState.current.value += (hoverState.current.target - hoverState.current.value) * 0.1;

        const elapsedTime = (time - startTime) / 1000.0;

        gl.uniform2f(uMouseLoc, mouse.current.x, mouse.current.y);
        gl.uniform1f(uTimeLoc, elapsedTime);
        gl.uniform1f(uHoverLoc, hoverState.current.value);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameId = requestAnimationFrame(render);
      };

      render(performance.now());
    };

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      // Cleanup WebGL
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [src]);

  // Handle interaction
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    // Normalize coordinates (0.0 to 1.0)
    // Note: WebGL Y is flipped relative to DOM
    mouse.current.targetX = (e.clientX - rect.left) / rect.width;
    mouse.current.targetY = 1.0 - ((e.clientY - rect.top) / rect.height);
  };

  const handleMouseEnter = () => {
    hoverState.current.target = 1.0;
  };

  const handleMouseLeave = () => {
    hoverState.current.target = 0.0;
    // Reset mouse to center on leave
    mouse.current.targetX = 0.5;
    mouse.current.targetY = 0.5;
  };

  return (
    <div 
      ref={wrapperRef} 
      className={`relative overflow-hidden ${className || ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#111111]">
          <span className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-cover"
        style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
      />
    </div>
  );
}
