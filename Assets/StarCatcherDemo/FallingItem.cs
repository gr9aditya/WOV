using UnityEngine;

public enum ItemKind { Star, Bomb }

/// One falling star or bomb. The GameManager owns spawning and collisions.
public class FallingItem : MonoBehaviour
{
    public ItemKind kind;
    public float speed = 3f;
    public float radius = 0.35f;

    float spin;

    void Awake()
    {
        spin = Random.Range(-120f, 120f);
    }

    void Update()
    {
        transform.position += Vector3.down * speed * Time.deltaTime;
        transform.Rotate(0f, 0f, spin * Time.deltaTime);
    }

    public bool IsBelowScreen(float bottomY)
    {
        return transform.position.y < bottomY - radius;
    }
}
