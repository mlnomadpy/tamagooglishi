# Sprite Assets Documentation

## Files
The game uses three distinct sprite sheets representing the growth stages of the pet:
1. `src/assets/sprites/baby.png` - Baby Stage (< 5 mins)
2. `src/assets/sprites/child.png` - Child Stage (5 - 15 mins)
3. `src/assets/sprites/adult.png` - Adult Stage (15+ mins)

## Grid Layout
Each sprite sheet follows a strict **6x6 Grid** layout.
- **Columns**: 6 Animation Frames per action.
- **Rows**: 6 Distinct Actions.

### Row Mapping
| Row Index | Action | Description |
| :--- | :--- | :--- |
| **0** | **IDLE** | Default breathing/standing state. |
| **1** | **WALKING** | Movement state (WASD control). |
| **2** | **EATING** | Feeding animation. |
| **3** | **PLAYING** | Happy/Jumping animation. |
| **4** | **SLEEPING** | Sleeping state (Zzz). |
| **5** | **DEAD** | Game Over state (Ghost/Halo). |

## Implementation Details
- The game automatically calculates frame size: `FrameWidth = ImageWidth / 6`.
- `Pet.js` switches the active sprite sheet property `this.sprite.image` based on the current age.
