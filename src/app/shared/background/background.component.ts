import { Component, ElementRef, AfterViewInit, ViewChild, OnDestroy, NgZone } from '@angular/core';
import * as THREE from 'three';
import { OrthographicCamera, WebGLRenderer, Scene, ShaderMaterial, PlaneGeometry, Mesh } from 'three';



@Component({
  selector: 'app-background',
  standalone: false,
  templateUrl: './background.component.html',
  styleUrl: './background.component.scss'
})
export class BackgroundComponent implements AfterViewInit {
  @ViewChild('bgCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: WebGLRenderer;
  private scene!: Scene;
  private camera!: OrthographicCamera;      // <-- qui
  private material!: ShaderMaterial;
  private animationFrameId = 0;
  private uniforms!: { [key: string]: { value: any } };
  ngZone: any;

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => {
      this.initThree();
      this.onResize();
      window.addEventListener('resize', this.onResize);
      this.animate();
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.animationFrameId);
    this.renderer.dispose();
    this.material.dispose();
  }

  private initThree() {
    const canvas = this.canvasRef.nativeElement;
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });

    // Debug context
    console.log("WebGL context:", this.renderer.getContext().getParameter(this.renderer.getContext().VERSION));

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.scene = new Scene();

    const aspect = window.innerWidth / window.innerHeight;

    // Camera corretta
    this.camera = new OrthographicCamera(-aspect, aspect, 1, -1, 0, 2);
    this.camera.position.z = 1; // Posizione corretta

    this.uniforms = {
      u_time: { value: 0.0 },
      u_ratio: { value: aspect },
    };

    // Geometria corretta
    const geometry = new PlaneGeometry(2 * aspect, 2);

    // Materiale temporaneo per debug
    const tempMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const mesh = new Mesh(geometry, tempMaterial); // Usa materiale temporaneo
    this.scene.add(mesh);
  }

  private onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    this.renderer.setSize(width, height);

    // Aggiorna piani sinistro/destro
    this.camera.left = -aspect;
    this.camera.right = aspect;
    // top e bottom restano 1 e -1 se vuoi mantenere altezza costante
    this.camera.updateProjectionMatrix();   // ora esiste!
    this.uniforms['u_ratio'].value = aspect;
  }

  private animate = () => {
    this.uniforms['u_time'].value += 0.05;
    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }
}
