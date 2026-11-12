# Tasks

~~t-1-wire simulation parameters to controls~~
Параметры интегрирования в buildTrajectories захардкожены (sigma=rho=beta=0.2, timeSpan=100, dt=0.01); поля σ/ρ в панели ни на что не влияют. Протащить параметры системы из Controls через стор в Canvas, в т.ч. дефолты для Лоренца (10, 28, 8/3).

t-2-check trajectory scale vs grid and camera
Масштаб траектории Лоренца (~±20 по z) может вылезать за грид 60x60 и кадр камеры. Проверить визуально, при необходимости подобрать размер грида/позицию камеры или масштаб сцены.

~~t-3-parameter descriptors in attractor modules~~
Описывать параметры системы (key, label, default, step) в модулях аттракторов; timeSpan/dt/initialConditions тоже из модуля. Controls рендерит поля параметров динамически, Canvas не содержит знаний о конкретных аттракторах — только презентация.

t-4-wire animation speed, particle size and count
Поля «Скорость анимации», «Размер частиц», «Количество частиц» в Controls пока статичные. Подключить их к стору: скорость — в анимационный цикл Canvas (PARTICLE_SPEED), размер — в геометрию частиц (createMovingParticle), количество — пересоздание частиц при изменении. Константы PARTICLE_SPEED и PARTICLES_PER_TRAJECTORY убрать из Canvas.
