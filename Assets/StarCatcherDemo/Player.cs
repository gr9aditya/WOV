using UnityEngine;

/// The paddle at the bottom of the screen. Arrow keys or A/D, or hold the mouse.
public class Player : MonoBehaviour
{
    public float speed = 11f;
    public float radius = 0.5f;

    float limitX;

    void Start()
    {
        var camera = Camera.main;
        limitX = camera.orthographicSize * camera.aspect - radius;
        transform.position = new Vector3(0f, -camera.orthographicSize + 0.9f, 0f);
    }

    void Update()
    {
        var position = transform.position;

        if (Input.GetMouseButton(0))
        {
            float targetX = Camera.main.ScreenToWorldPoint(Input.mousePosition).x;
            position.x = Mathf.MoveTowards(position.x, targetX, speed * Time.deltaTime);
        }
        else
        {
            float direction = 0f;
            if (Input.GetKey(KeyCode.LeftArrow) || Input.GetKey(KeyCode.A)) direction -= 1f;
            if (Input.GetKey(KeyCode.RightArrow) || Input.GetKey(KeyCode.D)) direction += 1f;
            position.x += direction * speed * Time.deltaTime;
        }

        position.x = Mathf.Clamp(position.x, -limitX, limitX);
        transform.position = position;
    }
}
