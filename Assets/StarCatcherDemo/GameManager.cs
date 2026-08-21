using System.Collections.Generic;
using UnityEngine;

/// Star Catcher: catch the stars, dodge the bombs, do not drop a star.
public class GameManager : MonoBehaviour
{
    public int startingLives = 3;

    readonly List<FallingItem> items = new List<FallingItem>();

    Player player;
    Sprite starSprite;
    Sprite bombSprite;

    float spawnTimer;
    float elapsed;
    int score;
    int lives;
    bool gameOver;

    float TopY => Camera.main.orthographicSize;
    float BottomY => -Camera.main.orthographicSize;
    float LimitX => Camera.main.orthographicSize * Camera.main.aspect;

    void Awake()
    {
        starSprite = Art.Star(new Color(1f, 0.83f, 0.25f));
        bombSprite = Art.Circle(new Color(0.85f, 0.22f, 0.28f));

        var playerObject = new GameObject("Player");
        playerObject.transform.SetParent(transform);
        var renderer = playerObject.AddComponent<SpriteRenderer>();
        renderer.sprite = Art.RoundedBox(new Color(0.35f, 0.85f, 1f));
        renderer.sortingOrder = 1;
        player = playerObject.AddComponent<Player>();

        StartNewGame();
    }

    void StartNewGame()
    {
        foreach (var item in items)
        {
            if (item != null) Destroy(item.gameObject);
        }
        items.Clear();

        score = 0;
        lives = startingLives;
        elapsed = 0f;
        spawnTimer = 0.5f;
        gameOver = false;
    }

    void Update()
    {
        if (gameOver)
        {
            if (Input.GetKeyDown(KeyCode.R)) StartNewGame();
            return;
        }

        elapsed += Time.deltaTime;

        spawnTimer -= Time.deltaTime;
        if (spawnTimer <= 0f)
        {
            Spawn();
            spawnTimer = Mathf.Max(0.30f, 0.95f - elapsed * 0.02f);
        }

        ResolveItems();
    }

    void Spawn()
    {
        bool isBomb = Random.value < Mathf.Min(0.40f, 0.12f + elapsed * 0.006f);

        var itemObject = new GameObject(isBomb ? "Bomb" : "Star");
        itemObject.transform.SetParent(transform);
        itemObject.transform.position = new Vector3(Random.Range(-LimitX + 0.5f, LimitX - 0.5f), TopY + 0.6f, 0f);

        var renderer = itemObject.AddComponent<SpriteRenderer>();
        renderer.sprite = isBomb ? bombSprite : starSprite;

        var item = itemObject.AddComponent<FallingItem>();
        item.kind = isBomb ? ItemKind.Bomb : ItemKind.Star;
        item.speed = Random.Range(2.6f, 3.6f) + elapsed * 0.09f;
        item.radius = isBomb ? 0.32f : 0.38f;

        items.Add(item);
    }

    void ResolveItems()
    {
        Vector2 playerPosition = player.transform.position;

        for (int i = items.Count - 1; i >= 0; i--)
        {
            var item = items[i];
            float touchDistance = item.radius + player.radius * 0.85f;

            if (Vector2.Distance(playerPosition, item.transform.position) <= touchDistance)
            {
                if (item.kind == ItemKind.Star) score += 10;
                else LoseLife();

                Remove(i);
                continue;
            }

            if (item.IsBelowScreen(BottomY))
            {
                if (item.kind == ItemKind.Star) LoseLife();
                Remove(i);
            }
        }
    }

    void Remove(int index)
    {
        Destroy(items[index].gameObject);
        items.RemoveAt(index);
    }

    void LoseLife()
    {
        lives--;
        if (lives <= 0)
        {
            lives = 0;
            gameOver = true;
        }
    }

    void OnGUI()
    {
        var hud = new GUIStyle(GUI.skin.label) { fontSize = 22, fontStyle = FontStyle.Bold };
        hud.normal.textColor = Color.white;

        GUI.Label(new Rect(16, 12, 300, 30), "Score  " + score, hud);
        GUI.Label(new Rect(16, 42, 300, 30), "Lives  " + new string('*', lives), hud);

        if (!gameOver) return;

        var center = new GUIStyle(hud) { fontSize = 40, alignment = TextAnchor.MiddleCenter };
        var hint = new GUIStyle(hud) { fontSize = 20, alignment = TextAnchor.MiddleCenter };

        GUI.Label(new Rect(0, Screen.height * 0.35f, Screen.width, 60), "GAME OVER", center);
        GUI.Label(new Rect(0, Screen.height * 0.35f + 60, Screen.width, 40), "Final score " + score, hint);
        GUI.Label(new Rect(0, Screen.height * 0.35f + 100, Screen.width, 40), "Press R to play again", hint);
    }
}
