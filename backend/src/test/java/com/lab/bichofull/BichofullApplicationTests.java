package com.lab.bichofull;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test") // <-- Isso faz o Spring ler o application-test.properties
class BichofullApplicationTests {

	@Test
	void contextLoads() {
	}

}
